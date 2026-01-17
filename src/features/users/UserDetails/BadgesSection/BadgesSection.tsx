import styles from "../UserDetailsPage.module.css";
import type {Badge} from "../UserDetailsPage.tsx";

interface BadgesSectionProps {
    badges: Badge[];
}

const BadgesSection = ({ badges }: BadgesSectionProps) => {
    return badges.length > 0 && (
        <div className={styles.badges}>
            {badges.map((badge) => (
                <div key={badge.id} className={styles.badgeItem}>
                    <div className={styles.badgeIcon}>
                        {badge.emoji ? (
                            <span className={styles.badgeEmoji}>{badge.emoji}</span>
                        ) : (
                            <img src={badge.icon_url} alt={badge.name} className={styles.badgeImg} />
                        )}
                    </div>
                    <div className={styles.badgeInfo}>
                        <p className={styles.badgeTitle}>{badge.name}</p>
                        {badge.description && (
                            <p className={styles.badgeDesc}>{badge.description}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default BadgesSection;








