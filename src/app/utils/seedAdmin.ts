import config from "../config";
import { User } from "../module/auth/auth.model";

const seedAdmin = async () => {
  const exists = await User.findOne({ email: config.admin_email });
  if (exists) return;

  await User.create({
    name: "Admin",
    email: config.admin_email,
    password: config.admin_password,
    role: "admin",
  });

  console.log("Admin user created");
};

export default seedAdmin;