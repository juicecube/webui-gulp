(function(): void {
  function report(lineNo: number = 0, columnNo: number = 0, stack: string = ''): void {
    const callback = (window as any).globalErrorHandler as ((errStacks: string[]) => void);
    if (callback) {
      let errStacks = [[lineNo, columnNo, stack].join(':')];
      if (G.__ERROR_QUEUE__.length) {
        errStacks = G.__ERROR_QUEUE__.concat(errStacks);
        G.__ERROR_QUEUE__ = [];
      }
      callback(errStacks);
    } else {
      G.__ERROR_QUEUE__.push(stack);
    }
  }

  window.onerror = function(msg: string, url: string, lineNo: number, columnNo: number, error?: Error): boolean {
    const stack = error?.stack || msg;
    report(lineNo, columnNo, stack);
    return false;
  };

  window.onunhandledrejection = function(evt: PromiseRejectionEvent): void {
    if (evt.reason) {
      report(0, 0, evt.reason.stack || evt.reason.message);
    }
  };
})();
