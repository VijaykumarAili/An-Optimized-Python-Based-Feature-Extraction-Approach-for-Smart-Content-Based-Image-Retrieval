db.students.aggregate([
  { $match: { course: "Big Data" } },
  {
    $group: {
      _id: "$course",
      totalStudents: { $sum: 1 },
      avgMarks: { $avg: "$marks" },
      maxMarks: { $max: "$marks" },
      minMarks: { $min: "$marks" }
    }
  }
])
