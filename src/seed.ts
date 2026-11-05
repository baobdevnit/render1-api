import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { UsersService } from './users/users.service.js';

async function bootstrap() {
  console.log('🌱 [Seed] Đang khởi tạo ứng dụng để seed dữ liệu...');

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const usersService = app.get(UsersService);

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const adminName = process.env.ADMIN_NAME || 'System Administrator';

    console.log(
      `🌱 [Seed] Đang kiểm tra/tạo tài khoản admin: ${adminEmail}...`,
    );

    const adminUser = await usersService.seedAdmin({
      email: adminEmail,
      password: adminPassword,
      name: adminName,
    });

    console.log('');
    console.log('========================================================');
    console.log('🎉 [Seed] Khởi tạo tài khoản Admin thành công!');
    console.log('--------------------------------------------------------');
    console.log(`👤 Họ và tên : ${adminUser.name}`);
    console.log(`📧 Email     : ${adminUser.email}`);
    console.log(`🛡️  Role      : ${adminUser.role}`);
    console.log(`🔑 Mật khẩu  : ${adminPassword}`);
    console.log('--------------------------------------------------------');
    console.log('💡 Ghi chú: Bạn có thể đăng nhập bằng tài khoản này tại:');
    console.log('   POST /auth/login để nhận access_token quyền admin.');
    console.log(
      '   Sau đó gọi GET /users hoặc GET /admin/users để xem danh sách.',
    );
    console.log('========================================================');
    console.log('');
  } catch (error) {
    console.error(
      '❌ [Seed] Thất bại khi thực hiện seed tài khoản admin:',
      error,
    );
    process.exit(1);
  } finally {
    await app.close();
  }
}

await bootstrap();
