const CompanyEligibility = require('../../models/CompanyEligibility');
const Company = require('../../models/Company');

class EligibilityEvaluator {
  /**
   * Evaluate a single student against a single company's recorded criteria
   */
  async evaluate(student, company) {
    const criteria = company.eligibilityCriteria || {};
    const studentDept = (student.department || '').trim();
    const studentCGPA = Number(student.CGPA || 0);
    const studentGradYear = Number(student.graduationYear || 2026);
    const studentActiveBacklogs = Number(student.activeBacklogsCount || 0);
    const isBacklogPending = student.backlogStatus === 'Pending Verification';

    // 1. CGPA Check
    const minCGPA = Number(criteria.minCGPA || 6.5);
    const cgpaMet = studentCGPA >= minCGPA;
    const cgpaResult = {
      required: minCGPA,
      actual: studentCGPA,
      status: cgpaMet ? 'Met' : 'Not Met',
      reason: cgpaMet
        ? `Student CGPA (${studentCGPA}) meets or exceeds minimum required (${minCGPA}).`
        : `Student CGPA (${studentCGPA}) is below the required cutoff of ${minCGPA}.`,
    };

    // 2. Department Check
    const allowedDepts = criteria.allowedDepartments || [];
    let deptMet = false;
    let deptReason = '';
    if (allowedDepts.length === 0 || allowedDepts.includes('All') || allowedDepts.includes('Any')) {
      deptMet = true;
      deptReason = 'All engineering departments are eligible for this recruitment drive.';
    } else {
      deptMet = allowedDepts.some(d => d.toLowerCase() === studentDept.toLowerCase() || studentDept.toLowerCase().includes(d.toLowerCase()));
      deptReason = deptMet
        ? `Department "${studentDept}" is on the permitted recruitment list.`
        : `Department "${studentDept}" is not currently in the allowed departments: ${allowedDepts.join(', ')}.`;
    }
    const deptResult = {
      allowed: allowedDepts,
      actual: studentDept,
      status: deptMet ? 'Met' : 'Not Met',
      reason: deptReason,
    };

    // 3. Graduation Year Check
    const gradYears = criteria.graduationYears || [2026];
    let gradMet = false;
    let gradReason = '';
    if (gradYears.length === 0 || gradYears.includes(studentGradYear)) {
      gradMet = true;
      gradReason = `Graduation batch (${studentGradYear}) matches the hiring target year.`;
    } else {
      gradMet = false;
      gradReason = `Graduation batch (${studentGradYear}) does not match drive requirement (${gradYears.join(', ')}).`;
    }
    const gradResult = {
      allowed: gradYears,
      actual: studentGradYear,
      status: gradMet ? 'Met' : 'Not Met',
      reason: gradReason,
    };

    // 4. Backlog Check
    const maxBacklogs = Number(criteria.maxActiveBacklogs ?? 0);
    let backlogStatus = 'Met';
    let backlogReason = '';

    if (isBacklogPending) {
      backlogStatus = 'Needs Verification';
      backlogReason = 'Official semester grade sheet and backlog status are pending college admin verification.';
    } else if (studentActiveBacklogs <= maxBacklogs) {
      backlogStatus = 'Met';
      backlogReason = `Active backlogs (${studentActiveBacklogs}) within acceptable limit (Max: ${maxBacklogs}).`;
    } else {
      backlogStatus = 'Not Met';
      backlogReason = `Active backlogs (${studentActiveBacklogs}) exceed maximum allowed (${maxBacklogs}).`;
    }

    const backlogResult = {
      maxAllowed: maxBacklogs,
      actual: studentActiveBacklogs,
      status: backlogStatus,
      reason: backlogReason,
    };

    // 5. Skills Check
    const studentSkills = (student.profileDetails?.skills || []).map(s => s.toLowerCase());
    const requiredSkills = (company.requiredSkills || company.eligibilityCriteria?.requiredSkills || []);
    const matched = [];
    const missing = [];

    requiredSkills.forEach(req => {
      if (studentSkills.some(s => s.includes(req.toLowerCase()) || req.toLowerCase().includes(s))) {
        matched.push(req);
      } else {
        missing.push(req);
      }
    });

    const skillsResult = {
      required: requiredSkills,
      matched,
      missing,
      status: missing.length === 0 ? 'Met' : (matched.length > 0 ? 'Partially Met' : 'Needs Verification'),
      reason: missing.length === 0
        ? 'Matches all specified technical skills.'
        : `Matched skills: [${matched.join(', ') || 'None'}]. Recommended to strengthen: [${missing.join(', ')}].`,
    };

    // Determine Overall Status
    let overallStatus = 'Eligible based on recorded criteria';
    let overallEligible = true;

    if (!cgpaMet || !deptMet || !gradMet || backlogStatus === 'Not Met') {
      overallStatus = 'Not eligible';
      overallEligible = false;
    } else if (backlogStatus === 'Needs Verification' || isBacklogPending) {
      overallStatus = 'Needs verification';
      overallEligible = false;
    }

    const result = {
      studentId: student._id,
      companyId: company._id,
      eligibilityStatus: overallStatus,
      overallEligible,
      criteriaResults: {
        cgpa: cgpaResult,
        department: deptResult,
        graduationYear: gradResult,
        backlogs: backlogResult,
        skills: skillsResult,
      },
      evaluatedAt: new Date(),
    };

    // Upsert to CompanyEligibility collection
    await CompanyEligibility.findOneAndUpdate(
      { studentId: student._id, companyId: company._id },
      result,
      { upsert: true, new: true }
    );

    return result;
  }

  /**
   * Evaluate student against all published company drives
   */
  async evaluateAllForStudent(student) {
    const companies = await Company.find({ status: 'published' });
    const results = [];
    for (const company of companies) {
      const evaluation = await this.evaluate(student, company);
      results.push({
        company: {
          _id: company._id,
          name: company.name,
          logo: company.logo,
          jobRoles: company.jobRoles,
          driveDate: company.driveDate,
          registrationDeadline: company.registrationDeadline,
          status: company.status,
          recruitmentRounds: company.recruitmentRounds,
        },
        ...evaluation,
      });
    }
    return results;
  }
}

module.exports = new EligibilityEvaluator();
