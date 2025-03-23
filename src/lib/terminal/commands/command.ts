export interface Command {
  process: (args: string[]) => string;
}