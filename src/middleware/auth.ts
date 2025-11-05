export function requireAuth(req: any, res: any, next: any) {
  if (req.session?.user) return next();
  return res.status(401).json({ error: "No autenticado" });
}
