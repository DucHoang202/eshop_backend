import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';

const router = Router();

function issueToken(user: { id: string; email: string; role: string }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, secret, { expiresIn: '7d' });
}

router.post('/register', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : undefined;
  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
    return res.status(400).json({ message: 'Email không hợp lệ hoặc mật khẩu phải có ít nhất 8 ký tự' });
  }
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email, passwordHash, ...(name ? { name } : {}) } });
    return res.status(201).json({ token: issueToken(user), user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return res.status(409).json({ message: 'Email đã được sử dụng' });
    }
    console.error('POST /api/auth/register failed:', error);
    return res.status(500).json({ message: 'Không thể tạo tài khoản' });
  }
});

router.post('/login', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
    return res.json({ token: issueToken(user), user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error('POST /api/auth/login failed:', error);
    return res.status(500).json({ message: 'Không thể đăng nhập' });
  }
});

export default router;
