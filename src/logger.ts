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

export default class Logger {
  private static logHandler: (messages: string, context: ILoggerContext) => void;
  private static contextualLoggersByNameMap = {};
  private context: ILoggerContext;

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

  public static setHandler(handler: (messages: string, context: ILoggerContext) => void) {
    Logger.logHandler = handler;
  }

  public static useDefaults(options: any) {
    console.log('EH EH');
		Logger.setLevel(options && options.defaultLevel || Logger.DEBUG);
		Logger.setHandler(Logger.createDefaultHandler(options));
	}

  public static setLevel(level: IFilterLevel) {
		// Set the globalLogger's level.
		// globalLogger.setLevel(level);

		for (let key in Logger.contextualLoggersByNameMap) {
			if (Logger.contextualLoggersByNameMap.hasOwnProperty(key)) {
				Logger.contextualLoggersByNameMap[key].setLevel(level);
			}
		}
	}

  public static createDefaultHandler(options: any) {
    options = options || {};

		options.formatter = options.formatter || function defaultMessageFormatter(messages, context) {
			if (context.name) {
				messages.unshift("[" + context.name + "]");
			}
		};

		let timerStartTimeByLabelMap = {};

		const invokeConsoleMethod = function (hdlr, messages) {
			Function.prototype.apply.call(hdlr, console, messages);
		};

    if (typeof console === "undefined") {
			return function () { /* no console */ };
		}

    return function(messages, context) {
			messages = Array.prototype.slice.call(messages);

			var hdlr = console.log;
			var timerLabel;

			if (context.level === Logger.TIME) {
				timerLabel = (context.name ? '[' + context.name + '] ' : '') + messages[0];

				if (messages[1] === 'start') {
					if (console.time) {
						console.time(timerLabel);
					}
					else {
						timerStartTimeByLabelMap[timerLabel] = new Date().getTime();
					}
				}
				else {
					if (console.timeEnd) {
						console.timeEnd(timerLabel);
					}
					else {
						invokeConsoleMethod(hdlr, [ timerLabel + ': ' +
							(new Date().getTime() - timerStartTimeByLabelMap[timerLabel]) + 'ms' ]);
					}
				}
			}
			else {
				if (context.level === Logger.WARN && console.warn) {
					hdlr = console.warn;
				} else if (context.level === Logger.ERROR && console.error) {
					hdlr = console.error;
				} else if (context.level === Logger.INFO && console.info) {
					hdlr = console.info;
				} else if (context.level === Logger.DEBUG && console.debug) {
					hdlr = console.debug;
				}

				options.formatter(messages, context);
				invokeConsoleMethod(hdlr, messages);
			}
		};
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

  public time(label: string) {
		if (typeof label === 'string' && label.length > 0) {
			this.invoke(Logger.TIME, [ label, 'start' ]);
		}
	}

  public timeEnd(label: string) {
    if (typeof label === 'string' && label.length > 0) {
    	this.invoke(Logger.TIME, [ label, 'end' ]);
    }
  }

  private invoke(level: IFilterLevel, msgArgs) {
		if (Logger.logHandler && this.enabledFor(level)) {
			Logger.logHandler(msgArgs, assign({ level: level }, {...this.context}));
		}
	}
}
