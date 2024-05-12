/**
 * aozora.ts
 **
 * function：テキスト整形
**/

// モジュール
import { promises } from "fs"; // fs
import iconv from 'iconv-lite'; // Text converter
import { toDakuon, toHandakuon } from 'kanadaku';

// ファイルシステム
const { readFile, writeFile } = promises;
// csv encoding
const CSV_ENCODING: string = 'SJIS';

// 結果型
interface removed {
    header: string;
    body: string;
}

// 置換型
interface replaced {
    original: string;
    replace: string;
}

// 注釈除去
const removeAnnotation = (str: string): Promise<removed | string> => {
    return new Promise(async (resolve, reject) => {
        try {
            // 注釈区切り
            const annotation: string = '-------------------------------------------------------';
            // 分割
            const result: string[] = str.split(annotation);
            // 結果
            resolve({
                header: result[0],
                body: str.split(annotation)[2],
            });

        } catch (e: unknown) {
            if (e instanceof Error) {
                // エラー
                console.log(e.message);
                reject(e.message);
            }
        }
    });
}

// フッタ除去
const removeFooter = (str: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        try {
            // 底本区切り
            const annotation: string = '底本：';
            // 分割
            const result: string[] = str.split(annotation);
            // 結果
            resolve(result[0]);

        } catch (e: unknown) {
            if (e instanceof Error) {
                // エラー
                console.log(e.message);
                reject(e.message);
            }
        }
    });
}

// ルビ(《》)除去
const removeRuby = (str: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        try {
            // 結果
            resolve(str.replace(/《.+?》/g, ''));

        } catch (e: unknown) {
            if (e instanceof Error) {
                // エラー
                console.log(e.message);
                reject(e.message);
            }
        }
    });
}

// かっこ([])除去
const removeBrackets = (str: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        try {
            // 結果
            resolve(str.replace(/［＃.*］/g, ''));

        } catch (e: unknown) {
            if (e instanceof Error) {
                // エラー
                console.log(e.message);
                reject(e.message);
            }
        }
    });
}

// 反復文字
const repeatCharacter = (str: string): Promise<string> => {
    return new Promise(async (resolve1, reject1) => {
        try {
            // 置換文字長
            let strLen: number = 0;
            // 文字位置
            let strPos: number = 0;
            // 文字位置
            let matchedStr: string = '';
            // 一時保存
            let tmpStr: string = str;
            // |除去
            const shortSymbols: string[] = ['ゝ', 'ゞ', '／＼', '／″＼'];
            // 処理
            await Promise.all(shortSymbols.map(async (smb: string): Promise<void> => {
                return new Promise(async (resolve2, reject2) => {
                    try {
                        // 含まれる場合
                        if (tmpStr.includes(smb)) {

                            // 濁音のとき
                            if (smb == '／″＼') {
                                // 置換文字長
                                strLen = 2;
                                // 文字位置
                                strPos = -strLen;

                            } else {
                                // 置換文字長
                                strLen = smb.length;
                                // 文字位置
                                strPos = -strLen * 2;
                            }

                            // 置換文字長が2文字以上
                            if (strLen > 1) {
                                matchedStr = '.{2}';

                            } else {
                                matchedStr = '.';
                            }

                            // 正規表現
                            const regex: RegExp = new RegExp(matchedStr + smb, 'g');
                            // マッチ部分
                            const match = tmpStr.match(regex);

                            // マッチあり
                            if (match) {
                                // 全処理
                                await Promise.all(match.map(async (mp: string): Promise<void> => {
                                    return new Promise(async (resolve3, reject3) => {
                                        try {
                                            // 直前の文字列
                                            let previousChar = '';
                                            // マッチした文字列
                                            let hitChar = '';

                                            // 濁音対応
                                            if (smb == '／″＼') {
                                                // 直前の文字列
                                                previousChar = toDakuon(mp.substring(0, strLen));
                                                // マッチした文字列
                                                hitChar = mp.substring(strLen, strLen * 2 + 1);

                                            } else {
                                                // 直前の文字列
                                                previousChar = mp.substring(0, strLen);
                                                // マッチした文字列
                                                hitChar = mp.substring(strLen, strLen * 2);
                                            }
                                            // 置換処理
                                            const replaced: string = mp.replace(hitChar, previousChar);
                                            // 全体置換
                                            tmpStr = tmpStr.replace(mp, replaced);

                                            // 結果
                                            resolve3();

                                        } catch (e: unknown) {
                                            if (e instanceof Error) {
                                                // エラー
                                                console.log(e.message);
                                                reject3();
                                            }
                                        }
                                    });
                                }));
                                // 結果
                                resolve2();

                            } else {
                                throw new Error("指定した文字列が見つかりません。");
                            }
                        }

                    } catch (e: unknown) {
                        if (e instanceof Error) {
                            // エラー
                            console.log(e.message);
                            reject2();
                        }
                    }
                });
            }));
            // 結果
            resolve1(tmpStr);

        } catch (e: unknown) {
            if (e instanceof Error) {
                // エラー
                console.log(e.message);
                reject1('error');
            }
        }
    });
}

// 不要文字除去
const removeSymbols = (str: string): Promise<string> => {
    return new Promise(async (resolve1, reject1) => {
        try {
            // 一時保存
            let tmpStr: string = str;
            // 除去対象
            const symbols: string[] = ['｜', '――'];
            // 除去
            await Promise.all(symbols.map((syb: string): Promise<void> => {
                return new Promise(async (resolve2, reject2) => {
                    try {
                        // 正規表現
                        const regStr: RegExp = new RegExp(syb, 'g');
                        // 除去処理
                        tmpStr = tmpStr.replace(regStr, '');
                        // 結果
                        resolve2();

                    } catch (e: unknown) {
                        if (e instanceof Error) {
                            // エラー
                            console.log(e.message);
                            reject2();
                        }
                    }
                })
            }));
            // 結果
            resolve1(tmpStr);

        } catch (e: unknown) {
            if (e instanceof Error) {
                // エラー
                console.log(e.message);
                reject1(e.message);
            }
        }
    });
}

// main
(async () => {
    try {
        // ファイル読み込み
        const txtdata = await readFile('txt/01gyokotsuki1.txt');
        // デコード
        const str = iconv.decode(txtdata, CSV_ENCODING);
        // 反復処理
        const removedStr0: string = await repeatCharacter(str);
        if (removedStr0 == 'error') {
            throw new Error('error0');
        }
        // 注釈除去
        const removedStr1: removed | string = await removeAnnotation(removedStr0);
        if (typeof (removedStr1) == 'string') {
            throw new Error('error1');
        }
        // フッタ除去
        const removedStr2: string = await removeFooter(removedStr1.body);
        if (removedStr2 == 'error') {
            throw new Error('error2');
        }
        // ルビ(《》)除去
        const removedStr3: string = await removeRuby(removedStr2);
        if (removedStr3 == 'error') {
            throw new Error('error3');
        }
        // かっこ([])除去
        const removedStr4: string = await removeBrackets(removedStr3);
        if (removedStr4 == 'error') {
            throw new Error('error4');
        }
        // 不要文字除去
        const removedStr5: string = await removeSymbols(removedStr4);
        if (removedStr5 == 'error') {
            throw new Error('error5');
        }
        // 書き出し
        await writeFile('modify/01gyokotsuki1.txt', removedStr1.header + removedStr5);
        // 完了
        console.log('finished.');

    } catch (e: unknown) {
        if (e instanceof Error) {
            // エラー
            console.log(e.message);
        }
    }
})();