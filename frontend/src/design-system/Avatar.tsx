import { avatarUrl } from "@mafioo/shared";

interface AvatarProps {
  avatarId: number;
  size?: number;
}

export function Avatar({ avatarId, size = 40 }: AvatarProps) {
  return (
    <img
      src={avatarUrl(avatarId)}
      width={size}
      height={size}
      alt=""
      style={{ borderRadius: 4, border: "1px solid var(--color-border)", objectFit: "cover" }}
      onError={(e) => {
        (e.target as HTMLImageElement).src = "/avatars/a-1.gif";
      }}
    />
  );
}
