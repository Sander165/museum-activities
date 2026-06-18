import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Activiteiten &amp; Workshops</h1>
        <p className={styles.intro}>
          Ontdek ons aanbod aan rondleidingen, workshops en lezingen. Bekijk wat
          er binnenkort op het programma staat en reserveer direct een plek.
        </p>
      </div>
    </header>
  );
}
