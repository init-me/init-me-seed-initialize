interface IConfig {
  path: string;
  hooks: {
    beforeStart(op: { env?: IEnv}): Promise<any>;
    beforeCopy(op: { fileMap: IFileMap, targetPath: string}): Promise<IFileMap>;
    afterCopy(op: { fileMap: IFileMap, targetPath: string}): Promise<any>;
  };
}
interface IEnv {
  type?: string
}
interface IFileMap {
  [orgPath: string]: string[]
}


declare const config: IConfig;

export = config;