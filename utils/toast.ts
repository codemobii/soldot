// toast

export class Toast {
  static duration: number = 5000;

  static send(message: string, status: "success" | "error" = "success") {
    if (typeof window !== "undefined") {
      const toastList = document.body;

      if (toastList) {
        const toast = document.createElement("div");
        toast.className = `toast ${status}`;
        toast.innerText = message;
        toastList.append(toast);
        setTimeout(() => {
          toast.remove();
        }, Toast.duration);
      }
    }
  }
}
