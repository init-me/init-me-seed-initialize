interface IConfig {
  path: string;
  hooks: {
    beforeStart(op: { env?: IEnv, targetPath: string}): Promise<any>;
    beforeCopy(op: { fileMap: IFileMap, targetPath: string, env?: IEnv}): Promise<IFileMap>;
    afterCopy(op: { fileMap: IFileMap, targetPath: string, env?: IEnv}): Promise<any>;
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