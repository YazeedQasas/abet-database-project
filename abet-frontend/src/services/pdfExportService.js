import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

class PDFExportService {
  constructor() {
    this.doc = null;
    this.currentY = 0;
    this.pageHeight = 297;
    this.margin = 20;

    // Sleek, professional color palette
    this.primary = [25, 30, 41]; // Deep charcoal
    this.secondary = [71, 85, 105]; // Slate gray
    this.accent = [37, 99, 235]; // Clean blue
    this.light = [248, 250, 252]; // Subtle off-white
    this.border = [226, 232, 240]; // Light border
    this.success = [16, 185, 129]; // Professional green
    this.warning = [245, 158, 11]; // Amber
    this.danger = [220, 38, 127]; // Professional red
  }

  async generateDashboardReport(dashboardData, logoUrl) {
    try {
      this.doc = new jsPDF();
      this.currentY = 0;

      this.addCleanHeader(logoUrl);
      this.addExecutiveDashboard(
        dashboardData.overview,
        dashboardData.progressMetrics
      );
      this.addStudentOutcomesReport(dashboardData.studentOutcomes);
      this.addCourseAnalysis(dashboardData.courses);
      this.addActivityLog(dashboardData.recentActivities);
      this.addMinimalFooter();

      this.doc.save("abet-assessment-report.pdf");
    } catch (error) {
      console.error("PDF generation failed:", error);
      throw error;
    }
  }

  formatDecimal(value) {
    return parseFloat(value || 0).toFixed(2);
  }

  formatScore(current, total = 10) {
    return `${current}/${total}`;
  }

  addCleanHeader(logoUrl) {
    // Clean white header with subtle border
    this.doc.setFillColor(255, 255, 255);
    this.doc.rect(0, 0, 210, 32, "F");

    // Minimal accent line at bottom only
    this.doc.setFillColor(...this.accent);
    this.doc.rect(0, 30, 210, 2, "F");

    if (logoUrl) {
      try {
        this.doc.addImage(logoUrl, "PNG", 15, 6, 20, 20);
      } catch (error) {
        console.warn("Logo could not be added");
      }
    }

    // Clean typography with dark text on white background
    this.doc.setTextColor(...this.primary);
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(24);
    this.doc.text("ABET Assessment Report", logoUrl ? 42 : 20, 18);

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(10);
    this.doc.setTextColor(...this.secondary);
    this.doc.text(
      `Academic Year 2024-2025 • Generated ${new Date().toLocaleDateString()}`,
      logoUrl ? 42 : 20,
      26
    );

    this.currentY = 50;
  }

  addExecutiveDashboard(overview, progressData) {
    this.addCleanSectionHeader("Executive Dashboard");

    const assessmentCount =
      overview.activeAssessments ||
      overview.assessments ||
      overview.totalAssessments ||
      0;

    // Sleek metric cards with proper data handling
    const metricsY = this.currentY;
    this.addSleekMetricCard(
      20,
      metricsY,
      "Courses",
      overview.totalPrograms || 0
    );
    this.addSleekMetricCard(65, metricsY, "Assessments", assessmentCount);
    this.addSleekMetricCard(
      110,
      metricsY,
      "Faculty",
      overview.facultyCount || 0
    );
    this.addSleekMetricCard(
      155,
      metricsY,
      "Students",
      overview.studentCount || 0
    );

    this.currentY = metricsY + 40;

    // Clean progress table
    this.doc.setTextColor(...this.primary);
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(14);
    this.doc.text("Progress Overview", this.margin, this.currentY);
    this.currentY += 18;

    const progressTableData = [
      [
        "Course Syllabi Update",
        `${this.formatDecimal(progressData.courseSyllabiUpdate)}%`,
      ],
      [
        "Assessment Data Collected",
        `${this.formatDecimal(progressData.assessmentDataCollected)}%`,
      ],
      ["Student Outcomes Met", this.formatScore(8, 10)],
      [
        "Faculty Training Complete",
        `${this.formatDecimal(progressData.facultyTrainingComplete)}%`,
      ],
    ];

    autoTable(this.doc, {
      startY: this.currentY,
      body: progressTableData,
      theme: "plain",
      bodyStyles: {
        fontSize: 11,
        cellPadding: 10,
        textColor: [...this.primary],
        lineColor: [...this.border],
        lineWidth: 0.1,
        halign: "left",
        valign: "middle",
        overflow: "linebreak",
      },
      columnStyles: {
        0: {
          cellWidth: 130,
          fontStyle: "normal",
          halign: "left",
          valign: "middle",
          overflow: "linebreak",
        },
        1: {
          cellWidth: 40,
          halign: "right",
          valign: "middle",
          fontStyle: "normal",
          textColor: [...this.accent],
          fontSize: 12,
          overflow: "linebreak",
        },
      },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = this.doc.lastAutoTable.finalY + 30;
  }

  addSleekMetricCard(x, y, label, value) {
    // Minimal card design
    this.doc.setFillColor(255, 255, 255);
    this.doc.rect(x, y, 40, 30, "F");

    // Subtle border
    this.doc.setDrawColor(...this.border);
    this.doc.setLineWidth(0.5);
    this.doc.rect(x, y, 40, 30, "S");

    // Clean accent line
    this.doc.setFillColor(...this.accent);
    this.doc.rect(x, y, 40, 2, "F");

    // Value with clean typography
    this.doc.setTextColor(...this.primary);
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(20);
    this.doc.text(value.toString(), x + 20, y + 16, { align: "center" });

    // Label
    this.doc.setTextColor(...this.secondary);
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9);
    this.doc.text(label, x + 20, y + 25, { align: "center" });
  }

  addStudentOutcomesReport(outcomesData) {
    if (!outcomesData || outcomesData.length === 0) return;

    this.checkPageBreak(100);
    this.addCleanSectionHeader("Student Outcomes Assessment");

    const tableData = outcomesData.map((outcome) => {
      // Fix status determination based on percentage
      let status = "Target Met";
      if (outcome.percentage >= 90) {
        status = "Exceeded";
      } else if (outcome.percentage < 70) {
        status = "Below Target";
      }

      return [
        outcome.outcome,
        outcome.description.substring(0, 50) +
          (outcome.description.length > 50 ? "..." : ""),
        this.formatDecimal(outcome.score),
        this.formatDecimal(outcome.percentage) + "%",
        status,
      ];
    });

    autoTable(this.doc, {
      startY: this.currentY,
      head: [["Outcome", "Description", "Score", "Achievement", "Status"]],
      body: tableData,
      theme: "plain",
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [...this.primary],
        fontSize: 10,
        fontStyle: "normal",
        cellPadding: 8,
        lineColor: [...this.border],
        lineWidth: 0.5,
        halign: "center",
        valign: "middle",
        overflow: "linebreak",
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 6,
        textColor: [...this.primary],
        lineColor: [...this.border],
        lineWidth: 0.1,
        halign: "left",
        valign: "middle",
        overflow: "linebreak",
      },
      alternateRowStyles: {
        fillColor: [252, 252, 253],
      },
      columnStyles: {
        0: {
          cellWidth: 20,
          fontStyle: "normal",
          halign: "center",
          valign: "middle",
          textColor: [...this.accent],
          overflow: "linebreak",
        },
        1: {
          cellWidth: 70,
          halign: "left",
          valign: "middle",
          overflow: "linebreak",
        },
        2: {
          cellWidth: 20,
          halign: "center",
          valign: "middle",
          fontStyle: "normal",
          overflow: "linebreak",
        },
        3: {
          cellWidth: 25,
          halign: "center",
          valign: "middle",
          fontStyle: "normal",
          overflow: "linebreak",
        },
        4: {
          cellWidth: 30,
          halign: "center",
          valign: "middle",
          fontSize: 8,
          overflow: "linebreak",
        },
      },
      tableWidth: "auto",
      margin: { left: this.margin, right: this.margin },
      didParseCell: (data) => {
        if (data.column.index === 4) {
          const status = data.cell.raw;
          if (status === "Exceeded") {
            data.cell.styles.textColor = [...this.success];
            data.cell.styles.fontStyle = "normal";
          } else if (status === "Below Target") {
            data.cell.styles.textColor = [...this.danger];
            data.cell.styles.fontStyle = "normal";
          } else if (status === "Target Met") {
            data.cell.styles.textColor = [...this.accent];
            data.cell.styles.fontStyle = "normal";
          }
        }
      },
    });

    this.currentY = this.doc.lastAutoTable.finalY + 30;
  }

  addCourseAnalysis(coursesData) {
    if (!coursesData || coursesData.length === 0) return;

    this.checkPageBreak(100);
    this.addCleanSectionHeader("Course Analysis");

    const tableData = coursesData.map((course) => [
      course.courseCode,
      course.courseName.length > 35
        ? course.courseName.substring(0, 35) + "..."
        : course.courseName,
      course.instructor,
      course.enrollment.toString(),
      this.formatDecimal(course.assessmentScore),
    ]);

    autoTable(this.doc, {
      startY: this.currentY,
      head: [["Code", "Course Name", "Instructor", "Students", "Score"]],
      body: tableData,
      theme: "plain",
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [...this.primary],
        fontSize: 10,
        fontStyle: "normal",
        cellPadding: 8,
        lineColor: [...this.border],
        lineWidth: 0.5,
        halign: "center",
        valign: "middle",
        overflow: "linebreak",
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 6,
        textColor: [...this.primary],
        lineColor: [...this.border],
        lineWidth: 0.1,
        halign: "left",
        valign: "middle",
        overflow: "linebreak",
      },
      alternateRowStyles: {
        fillColor: [252, 252, 253],
      },
      columnStyles: {
        0: {
          cellWidth: 20,
          fontStyle: "normal",
          textColor: [...this.accent],
          halign: "center",
          valign: "middle",
          overflow: "linebreak",
        },
        1: {
          cellWidth: 65,
          halign: "left",
          valign: "middle",
          overflow: "linebreak",
        },
        2: {
          cellWidth: 40,
          halign: "left",
          valign: "middle",
          overflow: "linebreak",
        },
        3: {
          cellWidth: 25,
          halign: "center",
          valign: "middle",
          overflow: "linebreak",
        },
        4: {
          cellWidth: 20,
          halign: "center",
          valign: "middle",
          fontStyle: "normal",
          overflow: "linebreak",
        },
      },
      tableWidth: "auto",
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = this.doc.lastAutoTable.finalY + 30;
  }

  addActivityLog(activitiesData) {
    if (!activitiesData || activitiesData.length === 0) return;

    this.checkPageBreak(80);
    this.addCleanSectionHeader("Recent Activity");

    const tableData = activitiesData
      .slice(0, 8)
      .map((activity) => [
        activity.description.length > 85
          ? activity.description.substring(0, 85) + "..."
          : activity.description,
        activity.timestamp,
      ]);

    autoTable(this.doc, {
      startY: this.currentY,
      head: [["Activity", "Date"]],
      body: tableData,
      theme: "plain",
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [...this.primary],
        fontSize: 10,
        fontStyle: "normal",
        cellPadding: 8,
        lineColor: [...this.border],
        lineWidth: 0.5,
        halign: "center",
        valign: "middle",
        overflow: "linebreak",
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 6,
        textColor: [...this.primary],
        lineColor: [...this.border],
        lineWidth: 0.1,
        halign: "left",
        valign: "middle",
        overflow: "linebreak",
      },
      alternateRowStyles: {
        fillColor: [252, 252, 253],
      },
      columnStyles: {
        0: {
          cellWidth: 125,
          halign: "left",
          valign: "middle",
          overflow: "linebreak",
        },
        1: {
          cellWidth: 45,
          halign: "left",
          valign: "middle",
          textColor: [...this.secondary],
          fontSize: 8,
          overflow: "linebreak",
        },
      },
      tableWidth: "auto",
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = this.doc.lastAutoTable.finalY + 30;
  }

  addCleanSectionHeader(title) {
    // Minimal section header
    this.doc.setTextColor(...this.primary);
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(16);
    this.doc.text(title, this.margin, this.currentY);

    // Clean underline
    this.doc.setDrawColor(...this.accent);
    this.doc.setLineWidth(1);
    this.doc.line(
      this.margin,
      this.currentY + 2,
      this.margin + 60,
      this.currentY + 2
    );

    this.currentY += 20;
  }

  addMinimalFooter() {
    const pageCount = this.doc.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);

      // Minimal footer line
      this.doc.setDrawColor(...this.border);
      this.doc.setLineWidth(0.5);
      this.doc.line(this.margin, 285, 190, 285);

      // Clean footer text
      this.doc.setTextColor(...this.secondary);
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(8);
      this.doc.text("ABET Assessment Report", this.margin, 292);
      this.doc.text(`${i} of ${pageCount}`, 190, 292, { align: "right" });
    }
  }

  checkPageBreak(requiredSpace) {
    if (this.currentY + requiredSpace > this.pageHeight - 25) {
      this.doc.addPage();
      this.currentY = 30;
    }
  }
}

export default new PDFExportService();
