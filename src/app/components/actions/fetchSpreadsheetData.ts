// src/app/actions/fetchSpreadsheetData.ts
'use server';

export async function fetchSpreadsheetData(participantId: string) {
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
    const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
    // スプレッドシートの範囲を指定（必要に応じて調整）
    const RANGE = `attendeeList_beastcup-tokyo!A:AW`;

    console.log(`Fetching spreadsheet data for participant ID: ${participantId}`);

    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Spreadsheet data:', data);
        if (data.values && data.values.length > 0) {
            // 1行目（ヘッダー）を取得
            const headers = data.values[0];
            // Id, GamerTag, Venue Type, Venue Fee Name, Total Owed の列インデックスを取得
            const indexes = ['GamerTag', 'Street Fighter 6', 'Venue Fee Name', 'Total Owed'].map(header => headers.indexOf(header));
            // participantIdに一致する行を探す
            const matchingRow = data.values.find((row: any) => row[0] === participantId);
            if (matchingRow) {
                // 必要な列のデータのみを抽出
                const result = indexes.reduce((obj, index, i) => {
                    obj[headers[index]] = matchingRow[index];
                    return obj;
                }, {});
                return result;
            } else {
                return null;
            }
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching spreadsheet data:", error);
        return null;
    }
}