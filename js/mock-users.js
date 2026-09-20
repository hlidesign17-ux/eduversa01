// Data akun otomatis untuk kelas X1-X5, XI1-XI5, dan XII1-XII5
function generateUsers() {
  const grades = ["X", "XI", "XII"];
  const classCodes = [
    { num: "1", code: "v" },
    { num: "2", code: "w" },
    { num: "3", code: "x" },
    { num: "4", code: "y" },
    { num: "5", code: "z" },
  ];

  const users = [];

  grades.forEach((grade) => {
    classCodes.forEach(({ num, code }) => {
      // Pembentukan nama kelas penuh (misal: "X1", "XI3", "XII5")
      const fullClassName = `${grade}${num}`;

      // Loop untuk 40 siswa per kelas
      for (let i = 1; i <= 40; i++) {
        const numStr = i < 10 ? `0${i}` : `${i}`;

        // Pola baru: edu + X1 + v + 01 -> eduX1v01
        const key = `${fullClassName}${code}${numStr}`;

        users.push({
          username: `edu${key}`,
          password: `alfalah${key}`,
          grade: grade,
          className: fullClassName, // Output: "X1", "X2", "XI1", dll.
        });
      }
    });
  });

  return users;
}

export const MOCK_USERS = generateUsers();
