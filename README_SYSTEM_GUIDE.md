# 🛡️ 스튜디오프리즘 방송제작 안전관리 시스템 (V3 최종 릴리즈)

스튜디오프리즘(Studio Prism) 제작사업부문 전담 안전관리 관제 및 모바일 QR 실시간 연동 시스템입니다.

---

## 📁 저장 경로 및 주요 파일 안내

### 1. 메인 작업 폴더
* **전체 경로**: `C:\안전관리`
* 현재 개발 및 실시간 서버(`npm run dev`)가 실행되고 있는 메인 프로젝트 폴더입니다.

### 2. V3 최종 영구 백업 스냅샷 폴더
* **백업 경로**: `C:\안전관리_V3_SNAPSHOT`
* 최종 완성된 소스 코드, 설정 파일, 데이터베이스, 스크립트가 온전히 복제 보관되어 있는 독립 백업 폴더입니다. 언제든지 이 폴더의 내용을 복사하여 원상 복구할 수 있습니다.

### 3. 실시간 데이터베이스 (DB) 파일
* **파일 경로**: `C:\안전관리\data\safety_db.json`
* 작업허가서, 신청된 허가 내역, TBM 일지, 방송 프로그램 목록, 안전점검 현황, 근로자 제보 내역 등 모든 실시간 데이터가 저장되는 영구 JSON DB 파일입니다.

### 4. 버전 정보 파일
* **파일 경로**: `C:\안전관리\VERSION.json`
* 현재 시스템의 버전(`v3.0.0`), 백업 시각, 최종 릴리즈 기능 목록(`changelog`), 안전관리 책임자(`이상욱 010-6670-3534`) 정보가 기록되어 있습니다.

### 5. 모바일 외부 접속 터널 URL 파일
* **파일 경로**: `C:\안전관리\data\tunnel_url.txt`
* 외부 스마트폰에서 QR코드로 접속할 수 있는 실시간 Cloudflare 보안 HTTPS 주소가 기록되어 있습니다.

---

## 🌐 시스템 접속 주소

* **🖥️ PC 관리자 관제 콘솔**: [http://localhost:3000](http://localhost:3000)
* **📱 모바일 안전작업허가서 신청**: [https://mixed-relation-prerequisite-rest.trycloudflare.com/work-permit-apply](https://mixed-relation-prerequisite-rest.trycloudflare.com/work-permit-apply)
* **📢 모바일 근로자 현장 위험 제보**: [https://mixed-relation-prerequisite-rest.trycloudflare.com/worker-report](https://mixed-relation-prerequisite-rest.trycloudflare.com/worker-report)

---

## 🚀 시스템 재시작 방법 (필요 시)

컴퓨터를 재부팅한 후 시스템을 다시 켤 때는 터미널(PowerShell 또는 명령 프롬프트)에서 아래 명령어를 실행하시면 됩니다:

1. **메인 웹서버 시작**:
   ```bash
   cd C:\안전관리
   npm run dev
   ```
2. **모바일 외부 QR 터널 시작 (스마트폰 접속용)**:
   ```bash
   cd C:\안전관리
   node tunnel.js
   ```

---

## 👥 담당자 정보
* **소속**: 스튜디오프리즘(Studio Prism) 제작사업부문 안전관리단
* **안전보건 총괄책임자**: 이상욱 안전관리 책임자
* **직통 연락처**: `010-6670-3534`
