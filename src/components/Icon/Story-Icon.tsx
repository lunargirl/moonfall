import Image from "next/image";
import styles from "./story-icon.module.css";
import Link from "next/link";

type StoryIconProps = {
  title: string;
  iconSrc: string;
  href: string;
  badgeLeft?: string;
  badgeCenter?: string;
  badgeRight?: string;
};

export default function StoryIcon({
  title,
  iconSrc,
  href,
  badgeLeft,
  badgeCenter,
  badgeRight,
}: StoryIconProps) {
  return (
    <Link href={href} className={styles.link}>
      <div className={styles.storyIcon}>
        <Image
          src="/icons/icon-bg.svg"
          alt=""
          fill
          className={styles.bg}
          priority
        />

        <div className={styles.image}>
          <Image
            src={iconSrc}
            alt={title}
            width={48}
            height={32}
            priority
            unoptimized
          />
        </div>

        <span className={styles.title}>{title}</span>

        {badgeLeft && (
          <Image
            src={badgeLeft}
            alt=""
            width={28}
            height={28}
            className={`${styles.badge} ${styles.badgeLeft}`}
            unoptimized
          />
        )}

        {badgeCenter && (
          <Image
            src={badgeCenter}
            alt=""
            width={28}
            height={28}
            className={`${styles.badge} ${styles.badgeCenter}`}
            unoptimized
          />
        )}

        {badgeRight && (
          <Image
            src={badgeRight}
            alt=""
            width={28}
            height={28}
            className={`${styles.badge} ${styles.badgeRight}`}
            unoptimized
          />
        )}
      </div>
    </Link>
  );
}
