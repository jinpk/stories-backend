# 비밀번호 재설정 Flow

1. /auth/passwordreset POST 요청

* 가입된 이메일 있는지 검증
* 가입된 이메일 있다면 token과 함꼐 FirebaseDynamicLink 생성
* 요청한 메일로 FirebaseDynamicLink 포함된 이메일 전송

2. 사용자 이메일의 버튼(FirebaseDynamicLink) 클릭

> __PC에서 이메일 버튼 클릭시 비밀번호 재설정 지원하지 않습니다. 무조건 모바일 디바이스에서 클릭해야 함!__

* 모바일 디바이스에서 버튼 클릭시 앱 자동실행

3. App에서 FirebaseDynamicLink Detect후 처리

* FirebaseDynamicLink를 parsing하면 link property 확인가능
* link의 query.action에 "password-reset"(변경가능) 확인
* link의 query.payload에 JWT 확인

4. 3번 로직 검증후 App에서 비밀번호 재설정 화면으로 이동후 /passwordreset/exec POST 호출하여 비밀번호 재설정 완료