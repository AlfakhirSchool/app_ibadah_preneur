import { PrismaClient, Role, Kelas } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create Admin
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { nis: "admin" },
    update: {},
    create: {
      name: "Administrator",
      nis: "admin",
      password: adminPassword,
      class: Kelas.AL_KINDI,
      role: Role.ADMIN,
    },
  });
  console.log(`✅ Admin created: ${admin.name} (NIS: ${admin.nis})`);

  // Create sample students
  const students = [
    { name: "Ahmad Fauzi", nis: "2025001", class: Kelas.AL_KINDI },
    { name: "Fatimah Azzahra", nis: "2025002", class: Kelas.AL_KINDI },
    { name: "Muhammad Rizky", nis: "2025003", class: Kelas.AL_KHAWARIZMI },
    { name: "Aisyah Putri", nis: "2025004", class: Kelas.AL_KHAWARIZMI },
    { name: "Umar Abdullah", nis: "2025005", class: Kelas.IBNU_KHOLDUN },
    { name: "Khadijah Sari", nis: "2025006", class: Kelas.IBNU_SINA },
    { name: "Ali Rahman", nis: "2025007", class: Kelas.IBNU_AL_HAYTAM },
    { name: "Zainab Husna", nis: "2025008", class: Kelas.IBNU_RUSYD },
  ];

  const studentPassword = await bcrypt.hash("siswa123", 12);

  for (const student of students) {
    const user = await prisma.user.upsert({
      where: { nis: student.nis },
      update: {},
      create: {
        name: student.name,
        nis: student.nis,
        password: studentPassword,
        class: student.class,
        role: Role.STUDENT,
      },
    });
    console.log(`✅ Student created: ${user.name} (NIS: ${user.nis})`);
  }

  // Create sample reports for some students
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayUTC = new Date(today.toISOString().split("T")[0] + "T00:00:00.000Z");

  const student1 = await prisma.user.findUnique({ where: { nis: "2025001" } });
  const student2 = await prisma.user.findUnique({ where: { nis: "2025002" } });

  if (student1) {
    await prisma.ibadahReport.upsert({
      where: {
        userId_date: { userId: student1.id, date: todayUTC },
      },
      update: {},
      create: {
        userId: student1.id,
        date: todayUTC,
        shalat: {
          fardhu: ["Subuh", "Dzuhur", "Ashar", "Maghrib", "Isya"],
          sunnah: ["Dhuha", "Tahajjud"],
        },
        tilawah: "QS. Al-Baqarah ayat 1-20",
        murojaah: "QS. An-Naba",
        sedekah: true,
        checklist: [
          "Berpakaian rapi & menutup aurat",
          "Bertutur kata sopan",
          "Menghormati guru & orang tua",
        ],
        goodDeeds: "Membantu teman mengerjakan PR matematika",
        improvement: "Ingin lebih rajin shalat tahajjud",
        knowledge: "Belajar tentang kisah Nabi Ibrahim AS",
        notes: "Alhamdulillah hari ini produktif",
      },
    });
    console.log("✅ Sample report created for Ahmad Fauzi");
  }

  if (student2) {
    await prisma.ibadahReport.upsert({
      where: {
        userId_date: { userId: student2.id, date: todayUTC },
      },
      update: {},
      create: {
        userId: student2.id,
        date: todayUTC,
        shalat: {
          fardhu: ["Subuh", "Dzuhur", "Ashar", "Maghrib"],
          sunnah: ["Dhuha"],
        },
        tilawah: "QS. Ali Imran ayat 1-15",
        murojaah: "QS. Al-Mulk",
        sedekah: false,
        checklist: [
          "Berpakaian rapi & menutup aurat",
          "Menghormati guru & orang tua",
          "Menjaga kebersihan lingkungan",
        ],
        goodDeeds: "Mengajar adik mengaji",
        improvement: "Ingin menyelesaikan shalat 5 waktu",
        knowledge: "Belajar hukum tajwid - Idgham",
        notes: "",
      },
    });
    console.log("✅ Sample report created for Fatimah Azzahra");
  }

  console.log("\n🎉 Seeding complete!");
  console.log("\n📋 Login credentials:");
  console.log("   Admin  → NIS: admin     | Password: admin123");
  console.log("   Siswa  → NIS: 2025001   | Password: siswa123");
  console.log("   (Semua siswa menggunakan password: siswa123)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
