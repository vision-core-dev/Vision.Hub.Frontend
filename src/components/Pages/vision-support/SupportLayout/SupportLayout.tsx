import { Outlet } from "react-router-dom";
import SupportSidebar from "../SupportSidebar/SupportSidebar";
import styles from "./SupportLayout.module.css";

export default function SupportLayout() {
  return (
    <div className={styles.wrapper}>
      <SupportSidebar />
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}
