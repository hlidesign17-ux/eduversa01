import { MOCK_USERS } from "./mock-users.js";
import { supabase } from "./supabase-config.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm =
    document.getElementById("login-form") ||
    document.querySelector(".auth-form");
  const usernameInput = document.getElementById("username-03");
  const passwordInput = document.getElementById("password-03");
  const fullnameInput = document.getElementById("fullname-03");
  const classSelect = document.getElementById("class-select-03");

  if (!loginForm) return;

  // Helper untuk mengekstrak tingkat kelas ("X", "XI", atau "XII")
  function extractGrade(className) {
    if (!className) return "X";
    if (className.startsWith("XII")) return "XII";
    if (className.startsWith("XI")) return "XI";
    if (className.startsWith("X")) return "X";
    return "X";
  }

  // Auto-fill & Lock Nama Lengkap & Kelas dari Supabase
  if (usernameInput) {
    usernameInput.addEventListener("blur", async () => {
      const inputUsername = usernameInput.value.trim().toLowerCase();
      if (!inputUsername) return;

      try {
        const { data: userDb } = await supabase
          .from("users01")
          .select("full_name, class_name")
          .eq("username", inputUsername)
          .maybeSingle();

        if (userDb) {
          if (fullnameInput && userDb.full_name) {
            fullnameInput.value = userDb.full_name;
            fullnameInput.disabled = true;
          }
          if (classSelect && userDb.class_name) {
            classSelect.value = userDb.class_name;
            classSelect.disabled = true;
          }
        } else {
          if (fullnameInput) fullnameInput.disabled = false;
          if (classSelect) classSelect.disabled = false;
        }
      } catch (err) {
        console.error("Gagal auto-fill data user:", err);
      }
    });
  }

  // 1. MANAJEMEN DEVICE ID UNIK
  let deviceId = localStorage.getItem("edualfalah_device_id");
  if (!deviceId) {
    deviceId =
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : "dev_" +
          Math.random().toString(36).substring(2, 15) +
          Date.now().toString(36);
    localStorage.setItem("edualfalah_device_id", deviceId);
  }

  // 2. EVENT LISTENER SUBMIT LOGIN
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const inputUsername = usernameInput.value.trim().toLowerCase();
    const inputPassword = passwordInput.value.trim();
    const inputFullName = fullnameInput ? fullnameInput.value.trim() : "";
    const inputClass = classSelect ? classSelect.value : "";

    // PERBAIKAN: Gunakan .toLowerCase() pada user.username agar tidak case-sensitive
    const foundUser = MOCK_USERS.find(
      (user) =>
        user.username.toLowerCase() === inputUsername &&
        user.password === inputPassword,
    );

    if (!foundUser) {
      alert("Username atau Password salah! Periksa kembali data login Anda.");
      return;
    }

    try {
      // CEK PENGUNCIAN PERANGKAT (users01)
      const { data: boundUser, error: boundErr } = await supabase
        .from("users01")
        .select("username")
        .eq("device_id", deviceId)
        .neq("username", inputUsername)
        .maybeSingle();

      if (boundErr) console.error("Supabase Device Check Error:", boundErr);

      if (boundUser) {
        alert(
          `AKSES DITOLAK!\nPerangkat ini sudah terdaftar untuk pengguna @${boundUser.username}.\nAnda tidak diizinkan menggunakan username lain pada perangkat yang sama.`,
        );
        return;
      }

      // CEK EKSISTENSI AKUN DI DATABASE (users01)
      const { data: existingUser } = await supabase
        .from("users01")
        .select(
          "username, full_name, class_name, grade, score_latihan01, is_latihan01_submitted",
        )
        .eq("username", inputUsername)
        .maybeSingle();

      let finalFullName = "";
      let finalClass = "";
      let finalGrade = "X";

      if (existingUser) {
        finalFullName = existingUser.full_name;
        finalClass = existingUser.class_name;
        finalGrade = existingUser.grade || extractGrade(finalClass);

        const { error: updateErr } = await supabase
          .from("users01")
          .update({
            device_id: deviceId,
            is_used: true,
          })
          .eq("username", inputUsername);

        if (updateErr) {
          console.error("Gagal update profil user ke Supabase:", updateErr);
          alert("Gagal melakukan autentikasi ke server. Coba lagi.");
          return;
        }
      } else {
        if (!inputFullName || !inputClass) {
          alert(
            "Harap lengkapi Nama Lengkap dan Kelas untuk pendaftaran awal!",
          );
          return;
        }

        finalFullName = inputFullName;
        finalClass = inputClass;
        finalGrade = extractGrade(inputClass);

        const { error: insertErr } = await supabase.from("users01").insert({
          username: inputUsername,
          device_id: deviceId,
          is_used: true,
          full_name: finalFullName,
          class_name: finalClass,
          grade: finalGrade,
          is_latihan01_submitted: false,
          score_latihan01: null,
        });

        if (insertErr) {
          console.error("Gagal membuat user baru di Supabase:", insertErr);
          alert("Gagal melakukan registrasi akun baru ke server. Coba lagi.");
          return;
        }
      }

      // SIMPAN SESI BARU
      localStorage.removeItem("edualfalah_session");

      localStorage.setItem("edualfalah_device_owner", inputUsername);
      localStorage.setItem("edualfalah_fullname", finalFullName);
      localStorage.setItem("edualfalah_class", finalClass);

      const isSubmitted = existingUser
        ? Boolean(existingUser.is_latihan01_submitted)
        : false;
      const userScore =
        existingUser && existingUser.score_latihan01 !== null
          ? existingUser.score_latihan01
          : 0;

      if (isSubmitted) {
        localStorage.setItem(`latihan01_locked_${inputUsername}`, "true");
        localStorage.setItem(`latihan01_score_${inputUsername}`, userScore);
      } else {
        localStorage.removeItem(`latihan01_locked_${inputUsername}`);
        localStorage.removeItem(`latihan01_score_${inputUsername}`);
      }

      localStorage.setItem(
        "edualfalah_session",
        JSON.stringify({
          username: foundUser.username,
          fullName: finalFullName,
          className: finalClass,
          grade: finalGrade,
          isLoggedIn: true,
        }),
      );

      setTimeout(() => {
        window.location.href = "05edualfalah2.html";
      }, 100);
    } catch (err) {
      console.error("Connection error:", err);
      alert("Gagal terhubung ke database. Periksa koneksi internet Anda.");
    }
  });

  // 3. TOGGLE MATA PASSWORD
  const toggleBtn = document.getElementById("toggle-password-03");
  if (toggleBtn && passwordInput) {
    const eyeOpen = toggleBtn.querySelector(".eye-open");
    const eyeClosed = toggleBtn.querySelector(".eye-closed");

    toggleBtn.addEventListener("click", () => {
      const isPassword = passwordInput.getAttribute("type") === "password";
      passwordInput.setAttribute("type", isPassword ? "text" : "password");

      if (eyeOpen) eyeOpen.classList.toggle("hidden", isPassword);
      if (eyeClosed) eyeClosed.classList.toggle("hidden", !isPassword);
    });
  }
});
