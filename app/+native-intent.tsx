export function redirectSystemPath({
  path,
  initial,
}: { path: string; initial: boolean }) {
  // OAuth 콜백 딥링크(klexi://auth?code=...)는 auth 화면으로 전달
  if (path.startsWith('/auth')) {
    return path;
  }
  return '/';
}
