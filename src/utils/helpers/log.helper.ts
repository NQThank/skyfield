class LogHelper {
  static log(level: string, message: any) {
    const timestamp = new Date().toLocaleString();
    console.log(`[${level.toUpperCase()}] [${timestamp}] ${message}`);
    // You can also send logs to a remote server here.
  }

  public static logInfo(message: any) {
    this.log('info', message);
  }

  public static logError(message: any) {
    this.log('error', message);
  }
}

export default LogHelper;
