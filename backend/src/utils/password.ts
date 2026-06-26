import bcrypt from 'bcryptjs';


export const hashPassword = async (plain: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(plain, saltRounds);
};

export const comparePassword = async (plain: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(plain, hash);
};
