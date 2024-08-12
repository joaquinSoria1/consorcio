import Admin from "@/models/admin";
import bcrypt from "bcryptjs";
import { ConnectMD } from "@/lib/conection";

export async function createAdminUserIfNotExist() {
  ConnectMD();
  const adminUser = await Admin.findOne({ email: 'admin@example.com' });
  if (!adminUser) {
      const admin = new Admin({
          nombres: 'Admin',
          apellidos: 'Admin',
          email: 'admin@example.com',
          telefono: 1234567890,
          role: 'admin',
          username: 'admin',
          password: await bcrypt.hash('admin123', 12),
      });
      try {
          const newAdmin = await admin.save();
          console.log('New admin created:', newAdmin);
          console.log('Admin user created successfully');
      } catch (error) {
          console.error('Error creating admin user:', error);
      }
  } else {
      console.log('Admin user already exists');
  }
}
