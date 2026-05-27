import Link from "next/link";

type Props = {
  title: string;
  description?: string;
  actionLabel?: string;
  href?: string;
};

export default function EmptyState({
  title,
  description,
  actionLabel,
  href,
}: Props) {
  return (
    <div className="empty-state">
      <h2 className="empty-state-title">😶 {title}</h2>

      {description && (
        <p className="empty-state-description">{description}</p>
      )}

      {href && actionLabel && (
        <div className="empty-state-action">
          <Link href={href} className="btn btn-primary">
            {actionLabel}
          </Link>
        </div>
      )}
    </div>
  );
}