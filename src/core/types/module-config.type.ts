export interface RouteProps {
  path: string;
  component: React.FC;
  redirect?: string;
  isAdmin?: boolean;
}
