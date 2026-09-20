// Data akun otomatis untuk kelas X, XI, dan XII (1-5)
function generateUsers() {
  const grades = ["X", "XI", "XII"];
  const classCodes = [
    { classSuffix: "1", code: "v" },
    { classSuffix: "2", code: "w" },
    { classSuffix: "3", code: "x" },
    { classSuffix: "4", code: "y" },
    { classSuffix: "5", code: "z" },
  ];

  const users = [];

  grades.forEach((grade) => {
    classCodes.forEach(({ classSuffix, code }) => {
      // Loop untuk 40 siswa per kelas
      for (let i = 1; i <= 40; i++) {
        const numStr = i < 10 ? `0${i}` : `${i}`;
        const key = `${grade}${code}${numStr}`;

        users.push({
          username: `edu${key}`,
          password: `alfalah${key}`,
          grade: grade,
          className: `${grade}-${classSuffix}`, // Contoh output: "X-1", "XI-2", dll.
        });
      }
    });
  });

  return users;
}

export const MOCK_USERS = generateUsers();
