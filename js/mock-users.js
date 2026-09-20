// mock-users.js
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
      const fullClassName = `${grade}${num}`;

      for (let i = 1; i <= 40; i++) {
        const numStr = i < 10 ? `0${i}` : `${i}`;
        const key = `${fullClassName}${code}${numStr}`;

        users.push({
          username: `edu${key}`.toLowerCase(),   // Hasil: edux1v01
          password: `alfalah${key}`,             // Hasil: alfalahX1v01
          grade: grade,
          className: fullClassName,
        });
      }
    });
  });

  return users;
}

export const MOCK_USERS = generateUsers();