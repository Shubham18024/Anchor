window.AnchorFileSystem = {
  exportDay(appData, date) {
    const payload = {
      meta: {
        app: "ANCHOR",
        version: appData.version,
        date
      },
      data: appData
    };

    // Encode (compact + unreadable)
    const encoded = btoa(
      unescape(encodeURIComponent(JSON.stringify(payload)))
    );

    const blob = new Blob([encoded], {
      type: "application/octet-stream"
    });

    alert(
      "IMPORTANT:\n\nSave this file inside your ANCHOR_DATA folder.\nDo NOT rename randomly."
    );

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ANCHOR_${date}.swa`;
    a.click();
    URL.revokeObjectURL(a.href);
  },

  importDay(file, onLoad) {
    if (!file.name.endsWith(".swa")) {
      alert("Invalid file format. Please select a .swa file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const decoded = decodeURIComponent(
          escape(atob(e.target.result))
        );
        const parsed = JSON.parse(decoded);

        if (!parsed.meta || parsed.meta.app !== "ANCHOR") {
          throw new Error("Not an ANCHOR file");
        }

        onLoad(parsed.data);
      } catch {
        alert("Corrupted or invalid ANCHOR file.");
      }
    };

    reader.readAsText(file);
  }
};
