import {assign} from 'lodash';

interface ILoggerContext {
    filterLevel: IFilterLevel;
}

interface ILogger {
  setLevel(newLevel: string);
  getLevel(): string;
}

interface IFilterLevel {
  name: string;
  value: number;
}

function defineLogLevel(value: number, name: string) {
  return { value: value, name: name };
}

class Logger {
  private context: ILoggerContext;
  private logHandler: any;

  public static DEBUG = defineLogLevel(1, 'DEBUG');
  public static INFO = defineLogLevel(2, 'INFO');
	public static TIME = defineLogLevel(3, 'TIME');
	public static WARN = defineLogLevel(4, 'WARN');
	public static ERROR = defineLogLevel(8, 'ERROR');
	public static OFF = defineLogLevel(99, 'OFF');

  public setLevel(newLevel: IFilterLevel) {
    if (newLevel && 'value' in newLevel) {
      this.context.filterLevel = newLevel;
    }
  }

  public getLevel(): IFilterLevel {
    return this.context.filterLevel;
  }

  public enabledFor(level: IFilterLevel) {
		var filterLevel = this.context.filterLevel;
		return level.value >= filterLevel.value;
	}

  public info () {
		this.invoke(Logger.INFO, arguments);
	}

  public debug () {
		this.invoke(Logger.DEBUG, arguments);
	}

  public warn () {
    this.invoke(Logger.WARN, arguments);
  }

  public error () {
    this.invoke(Logger.ERROR, arguments);
  }

  private invoke(level: IFilterLevel, msgArgs) {
		if (this.logHandler && this.enabledFor(level)) {
			this.logHandler(msgArgs, assign({ level: level }, {...this.context}));
		}
	}
}

let logger = new Logger();

export default logger;
