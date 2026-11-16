import type { ReactNode } from 'react';
import styles from './PasarelaPagos.module.css';

type FaqItem = {
  question: string;
  answer: ReactNode;
};

export default function PasarelaFaqAccordion({ items }: { items: readonly FaqItem[] }) {
  return (
    <div className={styles.faqStack}>
      {items.map((item, index) => (
        <details key={item.question} className={styles.faqItem} open={index === 0}>
          <summary className={styles.faqSummary}>
            <h3 className={styles.faqQuestion}>{item.question}</h3>
            <span aria-hidden="true" className={styles.faqIcon} />
          </summary>
          <div className={styles.faqAnswer}>
            <p className={styles.faqAnswerText}>{item.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
