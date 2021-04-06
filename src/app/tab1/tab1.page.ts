import { Component, ElementRef, ViewChild } from '@angular/core';
import { LoadingController, Platform, ToastController } from '@ionic/angular';
import jsQR from 'jsqr';

import * as forge from 'node-forge';
const pki = forge.pki;

const userCertPem =
`-----BEGIN CERTIFICATE-----
MIID9zCCAt+gAwIBAgIBATANBgkqhkiG9w0BAQUFADBkMQ4wDAYDVQQDEwViY2xl
ZTELMAkGA1UEBhMCS1IxEzARBgNVBAgTCmd5ZW9uZ2dpZG8xETAPBgNVBAcTCGdv
eWFuZ3NpMRAwDgYDVQQKEwdqb29uZ2J1MQswCQYDVQQLEwJpczAeFw0xOTEyMTAx
MjA2MjFaFw0yMDEyMTAxMjA2MjFaMGQxDjAMBgNVBAMTBWJjbGVlMQswCQYDVQQG
EwJLUjETMBEGA1UECBMKZ3llb25nZ2lkbzERMA8GA1UEBxMIZ295YW5nc2kxEDAO
BgNVBAoTB2pvb25nYnUxCzAJBgNVBAsTAmlzMIIBIjANBgkqhkiG9w0BAQEFAAOC
AQ8AMIIBCgKCAQEA7BoGIt4n6GDbsPITa6pJInh1GUIbzYOVW1y5mFp4iGsE6PFJ
fWGyMmwYnGvLjfq58pkLyFDYAqaqvP1z+OOScINOtTuyJAYHQB0Ex/3faPK0/nFk
EdSLln2RXtu2xyQ+/6kUiJpId1hbhmsVqd6y83KYyCIDK0zSjIul54du2YNf6gKM
FeP8R9OnuOKZ5WV+8wTlMy/gNvBLjZrWIcRL76xrp+agu0RmLkIKG8LOuAJhVpxi
Htt/NNRh8DN4aLPFOW4oqBXg6dxaR4ZX90zICHoVBLozS1/4N1sE7S0iXjNcCVV/
bZV+SBp61uLDeuH4BqriI4jhh3mHzgO4i9SRkQIDAQABo4GzMIGwMAwGA1UdEwQF
MAMBAf8wCwYDVR0PBAQDAgL0MDsGA1UdJQQ0MDIGCCsGAQUFBwMBBggrBgEFBQcD
AgYIKwYBBQUHAwMGCCsGAQUFBwMEBggrBgEFBQcDCDARBglghkgBhvhCAQEEBAMC
APcwJAYDVR0RBB0wG4YTaHR0cDovL2V4YW1wbGUub3JnL4cEfwAAATAdBgNVHQ4E
FgQU4zGVncKXUxGbsnzTW/g5Jl14o6kwDQYJKoZIhvcNAQEFBQADggEBAIe+Xrr0
OdvE5wDQccugCX5Wlia7+8XI6XBpp/X7XWp54rcOgzYJmFHU96NuYhwny88JR6wc
9G3CLFHNxVa8INbqQyBQlz0VU4wL1giOzR8CnFov8D7t+ctdTA3SHfLW0zhIIpmB
TI+WznnoU48EsHhNKW5rtzXSudPeqK+ef6h3GBcq4fe0QHeBzHgL/7imqxLf2Oq5
QOknGgpkb+Aps0h8WXD7XxRi5Pk1l9nKt57Hup5BlUedf0dLRxHV4CUYDtkmikgt
f5Qb/AfT2lb8MPINvtDjm2BLEt/qJ2+ziCYEss9CNdVrr6VS7X2Bodty2n5ONUGv
6XrauU/YyYT42XY=
-----END CERTIFICATE-----
`;

const userCert = pki.certificateFromPem(userCertPem);
const userPublicKey = userCert.publicKey;

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {



  scanActive = false;
  scanResult = null;
  verified = false;

  @ViewChild('video', { static: false }) video: ElementRef;
  @ViewChild('canvas', { static: false }) canvas: ElementRef;
  @ViewChild('fileinput', { static: false }) fileinput: ElementRef;

  videoElement: any;
  canvasElement: any;
  canvasContext: any;

  loading: HTMLIonLoadingElement;

  constructor(
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private plt: Platform
  ) {
    const isInStandaloneMode = () =>
    'standalone' in window.navigator && window.navigator['standalone'];
    if (this.plt.is('ios') && isInStandaloneMode()) {
      console.log('I am in an iOS PWA!');
    }
  }

  ngAfterViewInit() {
    this.videoElement = this.video.nativeElement;
    this.canvasElement = this.canvas.nativeElement;
    this.canvasContext = this.canvasElement.getContext('2d');
  }

  async startScan() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });
    this.videoElement.srcObject = stream;
    this.videoElement.setAttribute('playsinline', true);
    this.videoElement.play();

    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    requestAnimationFrame(this.scan.bind(this));
  }

  async scan() {
    if(this.videoElement.readyState === this.videoElement.HAVE_ENOUGH_DATA) {
      if(this.loading) {
        await this.loading.dismiss();
        this.loading = null;
        this.scanActive = true;
      }
      this.canvasElement.height = this.videoElement.videoHeight;
      this.canvasElement.width = this.videoElement.videoWidth;

      this.canvasContext.drawImage(
        this.videoElement,
        0,
        0,
        this.canvasElement.width,
        this.canvasElement.height
      );

      const imageData = this.canvasContext.getImageData(
        0,
        0,
        this.canvasElement.width,
        this.canvasElement.height
      );

      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      //console.log('Code: ', code);

      if(code) {
        this.scanActive = false;
        this.scanResult = code.data;

        let signedInfoObj = JSON.parse(this.scanResult);

        // 전자서명 검증
      const signature1Hex = signedInfoObj.sig;
      const signature1 = forge.util.hexToBytes(signature1Hex);
      const info1 = {
        product: signedInfoObj.product,
        email: signedInfoObj.email,
        price: signedInfoObj.price,
        url: signedInfoObj.url,
        ctime: signedInfoObj.ctime
      }

      const info1String = JSON.stringify(info1);

      let md1 = forge.md.sha1.create();
      md1.update(info1String, 'utf8');
      this.verified = userPublicKey.verify(md1.digest().bytes(), signature1);

        //this.showOrToast();
      } else {
        if(this.scanActive) {
          requestAnimationFrame(this.scan.bind(this));
        }
      }

    } else {
      requestAnimationFrame(this.scan.bind(this));
    }
  }

  // Helper functions
  stopScan() {
    this.scanActive = false;
  }

  reset() {
    this.scanResult = null;
  }

  async showOrToast() {
    const toast = await this.toastCtrl.create({
      message: `Open ${this.scanResult}?`,
      position: 'top',
      buttons: [
        {
          text: 'Open',
          handler: () => {
            window.open(this.scanResult, '_system', 'location=yes');
          }
        }
      ]
    });
    toast.present();
  }


}
