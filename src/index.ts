import {join} from "path";
import {writeFileSync} from "fs";
import type {Plugin} from "vite";

type Config = {
    base: string,
    build: {
        assetsDir: string
    }
}

type ChunkInfo = {
    code: string;
    fileName: string;
};


function microappPlugin(): Plugin {
    let basePath = '';

    return {
        name: 'vite-plugin-microapp',
        enforce: 'post',
        apply: 'build',
        configResolved(config: Config) {
            basePath = `${config.base}${config.build.assetsDir}/`;
        },
        writeBundle(options, bundle) {
            for (const chunkName in bundle) {
                if (Object.prototype.hasOwnProperty.call(bundle, chunkName)) {
                    const chunk = <ChunkInfo>bundle[chunkName];
                    if (chunk.fileName && chunk.fileName.endsWith('.js')) {
                        chunk.code = chunk.code.replace(
                            /(from|import\()(\s*['"])(\.\.?\/)([^'"]*)/g,
                            (all: string, _$1: string, _$2: string, $3: string) => {
                                return all.replace($3, new URL($3, basePath).toString());
                            }
                        );
                        const fullPath = join(options.dir ?? '', chunk.fileName);
                        writeFileSync(fullPath, chunk.code);
                    }
                }
            }
        },
    }
}

export default microappPlugin
