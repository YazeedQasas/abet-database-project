from .models import (
    Assessment, ContinuousImprovement, AcademicPerformance,
    AssessmentLearningOutcome, ABETOutcome, AssessmentLearningOutcome_ABET,
    CourseSyllabus, FacultyTraining, ABETComplianceMetric
)
from programs.models import Course, Faculty, Program, Department, CourseStudent
from django.db.models import Sum, F, ExpressionWrapper, FloatField, Avg, Count
from django.utils import timezone


class AssessmentService:
    @staticmethod
    def calculate_assessment_score(assessment_id):
        """Calculate the weighted average score for an assessment"""
        try:
            # Get all components for this assessment - FIXED field names
            cicomponents = ContinuousImprovement.objects.filter(
                assessment_id=assessment_id)
            apcomponents = AcademicPerformance.objects.filter(
                assessment_id=assessment_id)
            locomponents = AssessmentLearningOutcome.objects.filter(
                assessment=assessment_id)

            # Calculate weighted scores for each component type
            ciscore = 0
            ciweightsum = 0
            for ci in cicomponents:
                ciscore += ci.score * ci.weight
                ciweightsum += ci.weight

            apscore = 0
            apweightsum = 0
            for ap in apcomponents:
                apscore += ap.grade * ap.weight
                apweightsum += ap.weight

            # FIXED: Learning Outcomes scoring logic
            loscore = 0
            loweightsum = 0

            # Get all ABET outcome scores for this assessment's learning outcomes
            for lo in locomponents:
                # FIXED: Use correct field name 'assessment_lo'
                abet_scores = AssessmentLearningOutcome_ABET.objects.filter(
                    assessment_lo=lo)
                for abet_score in abet_scores:
                    # Convert 4-point scale to percentage (score/4.0 * 100)
                    normalized_score = (abet_score.score / 4.0) * 100
                    loscore += normalized_score
                    loweightsum += 1

            # Calculate normalized scores with dynamic component counting
            component_count = 0
            total_score = 0

            if ciweightsum > 0:
                cinormalized = ciscore / ciweightsum
                total_score += cinormalized
                component_count += 1
            else:
                cinormalized = 0

            if apweightsum > 0:
                apnormalized = apscore / apweightsum
                total_score += apnormalized
                component_count += 1
            else:
                apnormalized = 0

            if loweightsum > 0:
                lonormalized = loscore / loweightsum
                total_score += lonormalized
                component_count += 1
            else:
                lonormalized = 0

            # Calculate final score based on actual components with data
            finalscore = total_score / component_count if component_count > 0 else 0
            isabetaccredited = finalscore >= 90

            return {
                'total_score': finalscore,          # ✅ WITH underscore for new code
                'totalscore': finalscore,           # ✅ WITHOUT underscore for backward compatibility
                'continuous_improvement_score': cinormalized,
                'continuousimprovementscore': cinormalized,
                'academic_performance_score': apnormalized,
                'academicperformancescore': apnormalized,
                'learning_outcome_score': lonormalized,
                'learningoutcomescore': lonormalized,
                'is_abet_accredited': isabetaccredited,
                'isabetaccredited': isabetaccredited
            }
        except Exception as e:
            print(f"Error in calculate_assessment_score: {e}")
            import traceback
            traceback.print_exc()
            return {
                'total_score': 0,
                'totalscore': 0,
                'continuous_improvement_score': 0,
                'continuousimprovementscore': 0,
                'academic_performance_score': 0,
                'academicperformancescore': 0,
                'learning_outcome_score': 0,
                'learningoutcomescore': 0,
                'is_abet_accredited': False,
                'isabetaccredited': False
            }

    @staticmethod
    def get_average_score():
        """Calculate the average total score across all assessments."""
        try:
            assessments = Assessment.objects.all().only('id').iterator()
            total = 0
            count = 0

            for assessment in assessments:
                scores = AssessmentService.calculate_assessment_score(
                    assessment.id)  # ✅ Fixed method name
                total += scores['total_score']  # ✅ Use consistent key
                count += 1

            if count == 0:
                return 0.0
            return round(total / count, 2)
        except Exception as e:
            print(f"Error in get_average_score: {e}")
            return 0.0

    @staticmethod
    def get_dashboard_statistics():
        """Get comprehensive dashboard statistics"""
        basic_stats = {
            'programs': Program.objects.count(),
            'courses': Course.objects.count(),
            'assessments': Assessment.objects.count(),
            'departments': Department.objects.count(),
        }

        basic_stats['average_score'] = AssessmentService.get_average_score()
        return basic_stats

    @staticmethod
    def get_abet_outcomes_dashboard_data():
        """Get ABET outcomes data formatted for dashboard"""
        outcomes = []

        print("🎯 Calculating ABET outcomes...")

        for abet_outcome in ABETOutcome.objects.all():
            outcome_scores = AssessmentLearningOutcome_ABET.objects.filter(
                abet_outcome=abet_outcome
            )

            if outcome_scores.exists():
                scores = [score.score for score in outcome_scores]
                avg_score = sum(scores) / len(scores)
                percentage = (avg_score / 4.0) * 100

                if percentage >= 85:
                    status = "exceeded"
                elif percentage >= 75:
                    status = "met"
                else:
                    status = "below"
            else:
                avg_score = 0
                percentage = 0
                status = "below"

            outcomes.append({
                'id': abet_outcome.label,
                'label': abet_outcome.description,
                'score': avg_score,  # Raw score (2.92)
                'current_score': percentage,  # Percentage (72.9)
                'target': 4.0,
                'target_score': 75.0,
                'status': status
            })

        return outcomes

    @staticmethod
    def get_courses_assessment_summary():
        """Get course assessment summary with enhanced ABET outcome mapping"""
        from programs.models import CourseStudent

        courses_data = []
        print("📚 Calculating course assessment summary with outcome mapping...")

        for course in Course.objects.select_related('program', 'instructor'):
            assessments = Assessment.objects.filter(course=course)
            enrollment = CourseStudent.objects.filter(course=course).count()

            if course.instructor:
                instructor_name = course.instructor.name
            else:
                instructor_name = "TBD"

            if assessments.exists():
                total_scores = []
                mapped_outcomes = {}

                print(
                    f"  📖 Analyzing {course.name} with {assessments.count()} assessments...")

                for assessment in assessments:
                    score_data = AssessmentService.calculate_assessment_score(
                        assessment.id)
                    total_scores.append(score_data['total_score'])

                    # FIX: Initialize outcome_scores before the loop
                    all_outcome_scores = []

                    for learning_outcome in assessment.learning_outcomes.all():
                        outcome_scores = learning_outcome.outcome_scores.all()
                        all_outcome_scores.extend(
                            outcome_scores)  # Collect all scores

                        for outcome_score in outcome_scores:
                            outcome_label = outcome_score.abet_outcome.label
                            outcome_score_value = outcome_score.score

                            if outcome_label not in mapped_outcomes:
                                mapped_outcomes[outcome_label] = {
                                    'score': outcome_score_value,
                                    'status': 'assessed',
                                    'evidence_type': outcome_score.evidence_type
                                }
                            else:
                                if outcome_score_value > mapped_outcomes[outcome_label]['score']:
                                    mapped_outcomes[outcome_label]['score'] = outcome_score_value

                    # FIX: Use all_outcome_scores which is always defined
                    print(
                        f"    Assessment {assessment.name}: Found {len(all_outcome_scores)} outcome scores")

                # Calculate average assessment score
                avg_score = sum(total_scores) / \
                    len(total_scores) if total_scores else 0

                # Get total possible outcomes from database
                total_possible_outcomes = ABETOutcome.objects.count()
                outcome_coverage_percentage = (
                    len(mapped_outcomes) / max(total_possible_outcomes, 1)) * 100

                # Determine status
                if avg_score >= 85 and outcome_coverage_percentage >= 80:
                    status = "excellent"
                elif avg_score >= 75 and outcome_coverage_percentage >= 60:
                    status = "good"
                elif avg_score >= 60 or outcome_coverage_percentage >= 40:
                    status = "needs_improvement"
                else:
                    status = "needs_review"

                # Format outcomes for frontend
                outcomes_list = []
                for outcome_label, outcome_data in mapped_outcomes.items():
                    outcomes_list.append({
                        'label': outcome_label,
                        'score': outcome_data['score'],
                        'status': 'met' if outcome_data['score'] >= 3 else 'below',
                        'evidence_type': outcome_data['evidence_type']
                    })

            else:
                avg_score = 0
                mapped_outcomes = {}
                outcomes_list = []
                status = "needs_assessment"
                outcome_coverage_percentage = 0
                total_possible_outcomes = ABETOutcome.objects.count()

            course_data = {
                'code': f"COURSE-{course.id}",
                'name': course.name,
                'course_name': course.name,
                'instructor': instructor_name,
                'instructor_name': instructor_name,
                'enrollment': enrollment,
                'outcomes': [outcome['label'] for outcome in outcomes_list],
                'mapped_outcomes': outcomes_list,
                'outcome_coverage': round(outcome_coverage_percentage, 1),
                'assessmentScore': round(avg_score, 1),
                'assessment_score': round(avg_score, 1),
                'status': status
            }

            print(f"    ✅ {course.name}: Score={avg_score:.1f}, Outcomes={len(mapped_outcomes)}/{total_possible_outcomes}, Coverage={outcome_coverage_percentage:.1f}%, Status={status}")
            courses_data.append(course_data)

        print(
            f"✅ Returning {len(courses_data)} courses with enhanced outcome mapping")
        return courses_data

    @staticmethod
    def calculatedynamiccompliancemetrics():
        """Calculate real-time compliance metrics"""
        from programs.models import Course, Faculty

        print("Calculating dynamic compliance metrics...")

        # Define status function locally
        def get_status(percentage):
            if percentage >= 95:
                return 'excellent'
            elif percentage >= 80:
                return 'good'
            elif percentage >= 60:
                return 'warning'
            else:
                return 'critical'

        # 1. Course Syllabi Updated
        totalcourses = Course.objects.count()
        updatedsyllabi = CourseSyllabus.objects.filter(
            is_updated=True,
            academic_year='2024-2025'
        ).count()
        syllabipercentage = (updatedsyllabi / max(totalcourses, 1)) * 100

        # 2. Assessment Data Collected
        all_assessments = Assessment.objects.all()
        if all_assessments.exists():
            total_score = 0
            assessment_count = 0

            for assessment in all_assessments:
                try:
                    score_data = AssessmentService.calculate_assessment_score(
                        assessment.id)
                    if score_data and score_data.get('total_score', 0) > 0:
                        total_score += score_data['total_score']
                        assessment_count += 1
                except Exception as e:
                    print(
                        f"Error calculating score for assessment {assessment.id}: {e}")
                    continue

            if assessment_count > 0:
                average_score = total_score / assessment_count
                assessmentpercentage = round(average_score, 1)
            else:
                assessmentpercentage = 0
        else:
            assessmentpercentage = 0

        # 3. Student Outcomes Met - ENHANCED WITH DEBUGGING
        totalabetoutcomes = ABETOutcome.objects.count()
        outcomesmeetingthreshold = 0

        print(
            f"📊 Analyzing {totalabetoutcomes} ABET outcomes for compliance...")

        for abetoutcome in ABETOutcome.objects.all():
            outcomescores = AssessmentLearningOutcome_ABET.objects.filter(
                abet_outcome=abetoutcome
            )

            if outcomescores.exists():
                scores = [score.score for score in outcomescores]
                avgscore = sum(scores) / len(scores)
                percentage = (avgscore / 4.0) * 100

                print(
                    f"  📈 {abetoutcome.label} ({abetoutcome.description[:50]}...)")
                print(f"      Scores: {scores}")
                print(f"      Average: {avgscore:.2f}/4.0 = {percentage:.1f}%")

                if percentage >= 75.0:
                    outcomesmeetingthreshold += 1
                    print(f"      ✅ MEETS threshold (≥75%)")
                else:
                    print(f"      ❌ Below threshold (<75%)")
            else:
                print(f"  📊 {abetoutcome.label}: No assessment scores found")

        outcomespercentage = (outcomesmeetingthreshold /
                              max(totalabetoutcomes, 1)) * 100
        print(
            f"📊 FINAL: {outcomesmeetingthreshold}/{totalabetoutcomes} outcomes meet threshold = {outcomespercentage:.1f}%")

        # 4. Faculty Training Complete
        totalfaculty = Faculty.objects.count()
        trainedfaculty = FacultyTraining.objects.filter(
            is_completed=True,
            academic_year='2024-2025'
        ).values('faculty').distinct().count()
        trainingpercentage = (trainedfaculty / max(totalfaculty, 1)) * 100

        return {
            'course_syllabi': {
                'name': 'Course Syllabi Updated',
                'percentage': round(syllabipercentage, 1),
                'current': updatedsyllabi,
                'total': totalcourses,
                'target': 100,  # Just the number
                'status': get_status(syllabipercentage)
            },
            'assessment_data': {
                'name': 'Assessment Data Collected',
                'percentage': round(assessmentpercentage, 1),
                'current': assessment_count if 'assessment_count' in locals() else 0,
                'total': all_assessments.count() if 'all_assessments' in locals() else 0,
                'target': 90,  # Just the number
                'status': get_status(assessmentpercentage)
            },
            'student_outcomes': {
                'name': 'Student Outcomes Met',
                'percentage': f"{outcomesmeetingthreshold}/{totalabetoutcomes}",
                'current': outcomesmeetingthreshold,
                'total': totalabetoutcomes,
                # "8/10"
                'target': f"{int(totalabetoutcomes * 0.8)}/{totalabetoutcomes}",
                'status': get_status(outcomespercentage)
            },
            'faculty_training': {
                'name': 'Faculty Training Complete',
                'percentage': round(trainingpercentage, 1),
                'current': trainedfaculty,
                'total': totalfaculty,
                'target': 95,  # Just the number
                'status': get_status(trainingpercentage)
            }
        }

    @staticmethod
    def _get_status(percentage):
        """Determine status based on percentage"""
        if percentage >= 95:
            return 'excellent'
        elif percentage >= 80:
            return 'good'
        elif percentage >= 60:
            return 'warning'
        else:
            return 'critical'
            # In your service method, use this improved status logic:

    def determine_course_status(avg_score, mapped_outcomes_count, total_abet_outcomes=7):
        outcome_coverage = (mapped_outcomes_count / total_abet_outcomes) * 100

        if avg_score >= 85 and outcome_coverage >= 80:
            return "excellent"
        elif avg_score >= 75 and outcome_coverage >= 60:
            return "good"
        elif avg_score >= 60 or outcome_coverage >= 40:
            return "needs_improvement"
        else:
            return "needs_review"

    @staticmethod
    def get_assessment_methods_summary():
        """Get comprehensive assessment methods compliance summary"""
        from .models import AssessmentMethod, CourseAssessmentMethod

        methods_summary = []

        for method in AssessmentMethod.objects.filter(is_active=True):
            # Get all course assessments using this method
            course_assessments = CourseAssessmentMethod.objects.filter(
                assessment_method=method,
                semester='Fall 2024'
            )

            total_courses = course_assessments.values(
                'course').distinct().count()
            completed_assessments = course_assessments.filter(
                completion_status=True)
            completed_courses = completed_assessments.values(
                'course').distinct().count()

            # Calculate completion rate
            completion_rate = (completed_courses / max(total_courses, 1)) * 100

            # Calculate average score
            scores = completed_assessments.exclude(
                score__isnull=True).values_list('score', flat=True)
            avg_score = sum(scores) / len(scores) if scores else 0

            # Determine compliance status
            is_compliant = (
                completion_rate >= method.target_completion_rate and
                avg_score >= method.target_score
            )

            methods_summary.append({
                'name': method.get_name_display(),
                'assessment_type': method.get_assessment_type_display(),
                'courses': total_courses,
                'completion': f"{completion_rate:.0f}%",
                'completion_rate': completion_rate,
                'avg_score': round(avg_score, 1),
                'target_completion': method.target_completion_rate,
                'target_score': method.target_score,
                'is_compliant': is_compliant,
                'status': 'compliant' if is_compliant else 'non_compliant'
            })

        return methods_summary

    @staticmethod
    def get_compliance_dashboard_metrics():
        """Get overall compliance metrics for dashboard"""
        methods_summary = AssessmentService.get_assessment_methods_summary()

        if not methods_summary:
            return {
                'overall_compliance_rate': 0,
                'direct_assessment_compliance': 0,
                'indirect_assessment_compliance': 0,
                'total_methods': 0,
                'compliant_methods': 0,
                'methods_summary': []
            }

        # Calculate overall compliance
        compliant_methods = sum(
            1 for method in methods_summary if method['is_compliant'])
        total_methods = len(methods_summary)
        overall_compliance_rate = (compliant_methods / total_methods) * 100

        # Calculate direct vs indirect compliance
        direct_methods = [
            m for m in methods_summary if 'Direct' in m['assessment_type']]
        indirect_methods = [
            m for m in methods_summary if 'Indirect' in m['assessment_type']]

        direct_compliant = sum(1 for m in direct_methods if m['is_compliant'])
        indirect_compliant = sum(
            1 for m in indirect_methods if m['is_compliant'])

        direct_compliance = (direct_compliant /
                             max(len(direct_methods), 1)) * 100
        indirect_compliance = (indirect_compliant /
                               max(len(indirect_methods), 1)) * 100

        return {
            'overall_compliance_rate': round(overall_compliance_rate, 1),
            'direct_assessment_compliance': round(direct_compliance, 1),
            'indirect_assessment_compliance': round(indirect_compliance, 1),
            'total_methods': total_methods,
            'compliant_methods': compliant_methods,
            'methods_summary': methods_summary,
            'compliance_trends': AssessmentService.get_compliance_trends()
        }

    @staticmethod
    def get_compliance_trends():
        """Get compliance trends over time"""
        from django.utils import timezone
        from datetime import timedelta

        # Get compliance data for last 6 months
        six_months_ago = timezone.now().date() - timedelta(days=180)

        trends = []
        current_date = six_months_ago

        while current_date <= timezone.now().date():
            month_name = current_date.strftime('%B %Y')

            # Calculate compliance for this month (simplified)
            methods_summary = AssessmentService.get_assessment_methods_summary()
            compliant_methods = sum(
                1 for method in methods_summary if method['is_compliant'])
            total_methods = len(methods_summary) if methods_summary else 1
            compliance_rate = (compliant_methods / total_methods) * 100

            trends.append({
                'month': month_name,
                'compliance_rate': round(compliance_rate, 1),
                'date': current_date.isoformat()
            })

            # Move to next month
            if current_date.month == 12:
                current_date = current_date.replace(
                    year=current_date.year + 1, month=1)
            else:
                current_date = current_date.replace(
                    month=current_date.month + 1)

        return trends[-6:]  # Return last 6 months
