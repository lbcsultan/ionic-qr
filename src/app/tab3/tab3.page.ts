import { Component } from '@angular/core';

import * as forge from 'node-forge';
const pki = forge.pki;

const userPrivateKeyPem =
`-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEA7BoGIt4n6GDbsPITa6pJInh1GUIbzYOVW1y5mFp4iGsE6PFJ
fWGyMmwYnGvLjfq58pkLyFDYAqaqvP1z+OOScINOtTuyJAYHQB0Ex/3faPK0/nFk
EdSLln2RXtu2xyQ+/6kUiJpId1hbhmsVqd6y83KYyCIDK0zSjIul54du2YNf6gKM
FeP8R9OnuOKZ5WV+8wTlMy/gNvBLjZrWIcRL76xrp+agu0RmLkIKG8LOuAJhVpxi
Htt/NNRh8DN4aLPFOW4oqBXg6dxaR4ZX90zICHoVBLozS1/4N1sE7S0iXjNcCVV/
bZV+SBp61uLDeuH4BqriI4jhh3mHzgO4i9SRkQIDAQABAoIBAGUdBBG8uLShfpS6
J60NYYLcubGWiVeribR18poX7NTnmFO2ujVzOKC1gJjE5YkpnqcR+mTQkqIYBLkp
hphJxfZflb6yESmyVzqS8vA/foVwpCjwIN4t+5X4suBAEngYws40+DFEedJ6yb+4
bq+wS01Nf7b+MgNCRE2ipOuSKdwGv899+IGcEgh60byN6KVvfjShq3/WuDqxEE9t
sujdJWggGjDpNxFrB1vGYxc9rG2ajfHEfQE5awEQ7G+VC3nOybZPNL4DZgYj+VXq
SE4ZubC7io1S/3QKyDyeHvKBjMLLRSU9D1GL2nbporJ1Q3KoDzgbFV6c9kgn3Wb1
Pa25te0CgYEA/FFjzQtByfaWSkprakYLraJYMQooev8DKS4jWwUBWTJdomvI77H8
yJAQmHXm5KwaMwVpJuy+/pN4Z0o42/5WMpzxqZdIla74+K5j/lSWkxDSd+Tb6D8I
uuaT2ybUhrNraexQSjyUeNoS6xwqHmB6/pz42zpC/z6E++JH9uO7Lk8CgYEA74wN
ph4aCoIVjLh8aRmd9HwVLxkXqqvexMS1yJl5DmauQMZjGlCF82vY7PC1WCvbq8Yn
uPo2u4Li9z3ZT0C+bJgLjNYdrVu5VDWi5mNK/beWJPcZ9wi1XbNfgbIhH1XPKTok
VTEMS3HqB/ZDg3TVKE/MTOP60ZxUS0gdTykfKh8CgYEAwMoDgpk2VHXIUc1ZE6Of
qrUfw6CqW4hcRuvM8e/6HshACSloJ9WMe0awl32GxXTGs/NPbAF60hOl7O4mUdmc
zSFj+RvxxwUhkQnWt260enxhBGDmsibvqbcihFHAE4gl65I3qvFs1IZz7BbiC8HW
WJNiBkgXBuYjQD6elANfczsCgYEAwi0BE1rrOQFhfoQ9NOSzCW9brKXmbU6McWwS
/tyJKIdLUO5/fuEu87bETKyCE0rZ8k/Z+zO4Eh9y43+bG4cb1OMa2brmq5PiksQ3
nBF4xFmAt84lmf3RJnc0P+mot8HS/1RGB1iO4skgL/wLlg+qidbFgL58nlTeb3ex
am2m+XkCgYEA9UHK3+Kv02/5ldJWgpbtE8gwysDKjKa3RtqJScGxV/6qOYBF1Lzy
KGDh8GfeViz57vsUEsixjZKthhW9zP6uxJwA8tDke5tGvdxSvjFAC/VUXUgXRqBJ
IkfdKbpla/tny4YpQjYWO/S8zZTxvRLNlfc0KpAWT+CLIVJipKLteDg=
-----END RSA PRIVATE KEY-----
`;

const userPrivateKey = pki.privateKeyFromPem(userPrivateKeyPem);

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  public myAngularxQrCode: string = null;
  product = "iPhone 12";
  price = "1000000";
  url = "http://cris.joongbu.ac.kr";
  email = "abcde@gamil.com";
  elementType = 'url';

  constructor() {}

  genQR() {
    const curr_time = new Date().getTime();
    const info = {
      product: this.product,
      email: this.email,
      price: this.price,
      url: this.url,
      time: curr_time
    }
    const infoString = JSON.stringify(info);

    // 전자서명 생성
    let md = forge.md.sha1.create();
    md.update(infoString, 'utf8');
    const signature = userPrivateKey.sign(md);
    const signatureHex = forge.util.bytesToHex(signature);

    const signedInfo = {
      product: this.product,
      email: this.email,
      price: this.price,
      url: this.url,
      time: curr_time,
      sig: signatureHex  // 서명값 추가
    }
    // JSON object를 string으로 변환
    const signedInfoString = JSON.stringify(signedInfo);

    this.myAngularxQrCode = signedInfoString;
  }

}
