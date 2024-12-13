import { AppStoreServerAPIClient, Environment, SendTestNotificationResponse, SignedDataVerifier } from "@apple/app-store-server-library"
import dotenv from 'dotenv';
import axios from "axios";

(async () => {
    const jws: string = "eyJhbGciOiJFUzI1NiIsImtpZCI6IkFwcGxlX1hjb2RlX0tleSIsIng1YyI6WyJNSUlCeXpDQ0FYR2dBd0lCQWdJQkFUQUtCZ2dxaGtqT1BRUURBakJJTVNJd0lBWURWUVFERXhsVGRHOXlaVXRwZENCVVpYTjBhVzVuSUdsdUlGaGpiMlJsTVNJd0lBWURWUVFLRXhsVGRHOXlaVXRwZENCVVpYTjBhVzVuSUdsdUlGaGpiMlJsTUI0WERUSTBNVEl4TURFek1qUTBOMW9YRFRJMU1USXhNREV6TWpRME4xb3dTREVpTUNBR0ExVUVBeE1aVTNSdmNtVkxhWFFnVkdWemRHbHVaeUJwYmlCWVkyOWtaVEVpTUNBR0ExVUVDaE1aVTNSdmNtVkxhWFFnVkdWemRHbHVaeUJwYmlCWVkyOWtaVEJaTUJNR0J5cUdTTTQ5QWdFR0NDcUdTTTQ5QXdFSEEwSUFCSHdoVEtTUFJJcWVFTDgzeFYwSHhXemIxd3dtSXVnaWxhT3dcL0tnY3JnQVhZTE1tTGsxVSttM1ZlWlF3aUZOZ3NYQUUwMFNoRTVZaENYa0VTNUFBYXNHalREQktNQklHQTFVZEV3RUJcL3dRSU1BWUJBZjhDQVFBd0pBWURWUjBSQkIwd0c0RVpVM1J2Y21WTGFYUWdWR1Z6ZEdsdVp5QnBiaUJZWTI5a1pUQU9CZ05WSFE4QkFmOEVCQU1DQjRBd0NnWUlLb1pJemowRUF3SURTQUF3UlFJZ1VReWdEZzN3dzBBd2VObzhvZDNxZHQ4VDMwZmZzSDhtazZvOU92eVNCQmdDSVFDRkt2UEhvd3YrdE5jd04rVHJ5VnFkQm1MMG5lN2l0c1I4cUgrc004bFMzUT09Il0sInR5cCI6IkpXVCJ9.eyJkZXZpY2VWZXJpZmljYXRpb24iOiJaSmtJTFRLT005R05JUWl1WFp2cVlHc2ttRDFcLzdVUjhVcTc4c1wvUHBqUzdNdTFLcVYzbUFqeTYxVEZtekZTQW8iLCJwcm9kdWN0SWQiOiJwcmVtaXVtX2Vvc19hY2NvdW50IiwicHVyY2hhc2VEYXRlIjoxNzMzOTIyMzg2NTQzLjYxNywiaW5BcHBPd25lcnNoaXBUeXBlIjoiUFVSQ0hBU0VEIiwidHJhbnNhY3Rpb25SZWFzb24iOiJQVVJDSEFTRSIsInRyYW5zYWN0aW9uSWQiOiI5Iiwic3RvcmVmcm9udCI6IlVTQSIsImRldmljZVZlcmlmaWNhdGlvbk5vbmNlIjoiMmViZDRiOGMtMzllZC00MmIyLTliZjctMTcwYTY2YTEyNDMzIiwib3JpZ2luYWxQdXJjaGFzZURhdGUiOjE3MzM5MjIzODY1NDMuNjE3LCJxdWFudGl0eSI6MSwic2lnbmVkRGF0ZSI6MTczMzkyMjM4NzU4My4yNzQsInR5cGUiOiJDb25zdW1hYmxlIiwib3JpZ2luYWxUcmFuc2FjdGlvbklkIjoiOSIsImJ1bmRsZUlkIjoiY29tLm1hbmdhbGEucHJvd2FsbGV0IiwiZW52aXJvbm1lbnQiOiJYY29kZSIsInN0b3JlZnJvbnRJZCI6IjE0MzQ0MSJ9.LtBzQq5ZPcIsELGMVFoIshANmrJyRK9dMWLhDCbUUsfHHebZuosWQ49N6nLTQfi1fa80EvxIEPuI4QL-0Z1AmQ" // Receive this from client

    dotenv.config();

    const bundleId = process.env.BUNDLE_ID as string

    const environment = Environment.XCODE

    // const client = new AppStoreServerAPIClient(encodedKey, keyId, issuerId, bundleId, environment)
    const appleRootCAs = await readAppleCerts()
    const enableOnlineChecks = true
    const verifier = new SignedDataVerifier(appleRootCAs, enableOnlineChecks, environment, bundleId)

    const payload = await verifier.verifyAndDecodeTransaction(jws)

    console.log(payload)
})();

// https://github.com/apple/app-store-server-library-node/issues/18

async function readAppleCerts(): Promise<Buffer[]> {
    try {
        const urls = [
            'https://www.apple.com/appleca/AppleIncRootCertificate.cer',
            'https://www.apple.com/certificateauthority/AppleComputerRootCertificate.cer',
            'https://www.apple.com/certificateauthority/AppleRootCA-G2.cer',
            'https://www.apple.com/certificateauthority/AppleRootCA-G3.cer',
        ];

        return await Promise.all(urls.map((url) => downloadAppleCert(url)));
    } catch (error) {
        console.log('Error in downloading Apple certificates:', error);
        throw error;
    }
}

async function downloadAppleCert(url: string): Promise<Buffer> {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    } catch (error) {
        console.log(`Error downloading ${url}:`, error);
        throw error;
    }
}
