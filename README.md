# 🐙 mini-git

> Git의 내부 구조를 직접 구현해보는 CLI 기반 학습 프로젝트입니다.

Git의 내부 동작 원리를 학습하며 구현한 Git 클론 프로젝트입니다.  
Git 객체(`blob`, `tree`, `commit`) 생성과 참조 과정을 직접 구현해보며 구조를 체화했습니다.

# 시연 데모

<img src="./images/mini-git-demo.gif" width="650" alt="mini-git CLI 시연 데모" />

```plaintext
Working Dir → add() → Blob (해시)
              ↓
          Index (스테이징)
              ↓
        commit() → Tree → Commit
                        ↑
               HEAD → Branch (refs/heads/main)
```

## 구현 기능

| 명령어     | 설명                                          |
| ---------- | --------------------------------------------- |
| `init`     | 저장소 초기화                                 |
| `add`      | 파일을 `Blob` 객체로 저장 후 `index` 기록     |
| `commit`   | `Tree`, `Commit` 객체 생성 및 `HEAD` 업데이트 |
| `branch`   | 새로운 브랜치 생성                            |
| `checkout` | 브랜치 전환                                   |
| `log`      | 커밋 로그 출력                                |

## 설치 및 사용

```bash
npm install

# 일반 실행
node src/index.js init
node src/index.js add hello.txt
node src/index.js commit "first commit"

# 또는 CLI 명령어로 등록 (1회 실행)
npm link

# 이후부터
mini-git init
mini-git add hello.txt
mini-git commit "first commit"

```

## 디렉토리 구조

```bash
src
├── index.js                # CLI 진입점 (전략 패턴으로 명령어 분기)
├── commands/               # 각 명령어 실행 함수
├── core/                   # Git 내부 로직 (객체 생성, 해시 처리 등)
├── strategies/             # 명령어 분기 로직 (전략 패턴)
├── config/                 # 사용자 정보 및 환경 설정
├── utils/                  # 공통 유틸 함수
├── domain/                 # 메시지, 상수, Enum 정의
└── __test__/               # Jest 테스트 코드
```

## 기술 스택

| 기술                     | 사용 목적 및 역할                        |
| ------------------------ | ---------------------------------------- |
| **Node.js**              | CLI 기반 명령어 실행 환경                |
| **Jest**                 | 커맨드별 단위 테스트 수행                |
| **SHA-1 해시 구현**      | Git 객체 간 참조를 위한 고유 식별자 생성 |
| **파일 시스템 스토리지** | `.mini-git` 디렉토리에 Git 객체 저장     |
| **JSDoc**                | 함수 및 모듈 문서 자동 생성 도구         |

> 복잡한 유틸 함수의 JSDoc 기반 자동 문서는 [여기서 확인](https://mindaaaa.github.io/mini-git/global.html)할 수 있습니다.

🔍 더 깊은 내용이 궁금하다면?
