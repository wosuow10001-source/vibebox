# 권한 에러 해결 방법

## 문제
```
Error: EPERM: operation not permitted, open 'C:\Users\zeis1\Downloads\vibebox\.next\trace'
```

`.next` 폴더에 대한 쓰기 권한이 없거나 파일이 잠겨있습니다.

## 해결 방법

### 방법 1: 관리자 권한으로 실행 (권장) ⭐

1. **PowerShell을 관리자 권한으로 실행**
   - Windows 검색에서 "PowerShell" 검색
   - 우클릭 → "관리자 권한으로 실행"

2. **프로젝트 폴더로 이동**
   ```powershell
   cd C:\Users\zeis1\Downloads\vibebox
   ```

3. **.next 폴더 삭제**
   ```powershell
   Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
   ```

4. **서버 시작**
   ```powershell
   npm run dev
   ```

### 방법 2: 파일 탐색기에서 수동 삭제

1. **파일 탐색기 열기**
   - `C:\Users\zeis1\Downloads\vibebox` 폴더로 이동

2. **.next 폴더 찾기**
   - 숨김 파일 표시: 보기 → 숨김 항목 체크

3. **.next 폴더 삭제**
   - 우클릭 → 삭제
   - "관리자 권한 필요" 나오면 "계속" 클릭

4. **PowerShell에서 서버 시작**
   ```powershell
   npm run dev
   ```

### 방법 3: 안티바이러스 일시 중지

일부 안티바이러스가 `.next` 폴더를 잠글 수 있습니다.

1. 안티바이러스 일시 중지 (5분)
2. .next 폴더 삭제
3. 서버 시작
4. 안티바이러스 다시 활성화

### 방법 4: 프로세스 확인 및 종료

1. **Node 프로세스 확인**
   ```powershell
   Get-Process node -ErrorAction SilentlyContinue
   ```

2. **모든 Node 프로세스 종료**
   ```powershell
   Stop-Process -Name node -Force -ErrorAction SilentlyContinue
   ```

3. **.next 폴더 삭제**
   ```powershell
   Remove-Item -Recurse -Force .next
   ```

4. **서버 시작**
   ```powershell
   npm run dev
   ```

### 방법 5: 다른 위치로 프로젝트 이동

Downloads 폴더는 권한 문제가 발생할 수 있습니다.

1. **프로젝트를 다른 위치로 복사**
   ```powershell
   # 예: C:\Projects로 이동
   Copy-Item -Recurse C:\Users\zeis1\Downloads\vibebox C:\Projects\vibebox
   cd C:\Projects\vibebox
   ```

2. **.next 폴더가 있다면 삭제**
   ```powershell
   Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
   ```

3. **서버 시작**
   ```powershell
   npm run dev
   ```

## 빠른 해결 스크립트

PowerShell을 **관리자 권한**으로 열고 실행:

```powershell
# 프로젝트 폴더로 이동
cd C:\Users\zeis1\Downloads\vibebox

# 모든 Node 프로세스 종료
Stop-Process -Name node -Force -ErrorAction SilentlyContinue

# 잠시 대기
Start-Sleep -Seconds 2

# .next 폴더 삭제
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# 서버 시작
npm run dev
```

## 예상 결과

서버가 정상적으로 시작되면:
```
✓ Starting...
✓ Ready in 3s
```

## 문제가 계속되면

### 완전 재설치
```powershell
# 관리자 권한 PowerShell에서
cd C:\Users\zeis1\Downloads\vibebox

# 모든 캐시 삭제
Remove-Item -Recurse -Force .next, node_modules -ErrorAction SilentlyContinue

# 재설치
npm install

# 서버 시작
npm run dev
```

## 주의사항

⚠️ **관리자 권한**으로 PowerShell을 실행하세요
⚠️ 안티바이러스가 파일을 잠그고 있을 수 있습니다
⚠️ Downloads 폴더는 권한 문제가 자주 발생합니다
⚠️ 모든 Node 프로세스를 종료한 후 시도하세요

## 권장 사항

앞으로 이런 문제를 피하려면:
1. 프로젝트를 `C:\Projects` 같은 폴더에 저장
2. 개발 시 관리자 권한으로 PowerShell 사용
3. 안티바이러스 예외 목록에 프로젝트 폴더 추가
