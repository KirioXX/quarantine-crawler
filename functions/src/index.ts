import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { crawlRKIRiskList } from './rkiCrawler';

admin.initializeApp();
const db = admin.firestore();
const rkiList = db.collection('rkiList');


const syncRKICountriesWithDB = async (countriesList: Array<{ name: string, added: string } | null>) => {
    const rkiListSnap = await (await rkiList.get()).docs;
    for (let country of countriesList) {
        const index = rkiListSnap.findIndex(doc => doc.get("name") === country?.name);
        if (index === -1 && country) {
            const uid = rkiList.doc().id;
            await rkiList.doc(uid).set(country)
        } else {
            rkiListSnap.splice(index, 1);
        }
    }
    if (rkiListSnap.length > 0) {
        for (let listElement of rkiListSnap) {
            await rkiList.doc(listElement.id).delete();
        }
    }
}

export const startRKICrawl = functions.https.onRequest(async (request, response) => {
    const riskList = await crawlRKIRiskList();
    await syncRKICountriesWithDB(riskList);
    response.send(JSON.stringify(riskList));
});
