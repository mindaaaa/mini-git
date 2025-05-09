# 🐙 mini-git

> Git의 내부 구조를 직접 구현해보는 CLI 기반 학습 프로젝트입니다.

`add`, `commit`, `log`, `branch`, `checkout` 등  
Git의 핵심 동작을 JavaScript로 재구현하면서  
*버전 관리 시스템의 원리*를 몸으로 이해하는 것을 목표로 합니다.

---

## 📌 프로젝트 목표

- Git의 **snapshot 기반 저장 구조** 체득
- `blob`, `tree`, `commit`, `HEAD` 등 Git 객체 구조 직접 구현
- CLI 명령어 흐름(`git add`, `git commit`, `git log`)을 JavaScript로 재현
- 구조 설계를 통해 **자료구조, 파일시스템, OOP 감각** 강화

## ⚙️ 사용 기술

| 분류        | 기술                                        |
| ----------- | ------------------------------------------- |
| 언어        | JavaScript (Node.js)                        |
| 파일 I/O    | `fs` 모듈                                   |
| CLI 처리    | `process.argv`, `readline`                  |
| 데이터 저장 | JSON 기반 `.mygit/` 디렉토리 내부 객체 구조 |

## 주요 기능

| 명령어     | 설명                                              |
| ---------- | ------------------------------------------------- |
| `init`     | `.mygit/` 폴더 생성 및 초기 구조 설정             |
| `add`      | - 파일을 읽고 해시(blob)로 저장<br>- index에 등록 |
| `commit`   | snapshot 저장, 이전 커밋과 연결                   |
| `log`      | HEAD에서 커밋 히스토리 추적 및 출력               |
| `branch`   | 브랜치 포인터 생성                                |
| `checkout` | HEAD 포인터 전환 및 상태 변경                     |

---

## 🧱 디렉토리 구조

```bash
mini-git/
├── src/
│   ├── commands/       # CLI 명령어 처리 로직 (init, add, commit 등)
│   ├── core/           # Git 내부 처리 로직 (객체 저장, HEAD 갱신 등)
│   ├── domain/         # Git의 핵심 객체 (Blob, Tree, Commit, Branch)
│   ├── utils/          # 해시 계산 등 유틸 함수
│   └── index.js        # CLI 진입점
├── .mygit/             # Git 객체가 저장되는 폴더 (init 후 생성됨)
├── .gitignore          # Git 추적 제외 설정
├── package.json        # 프로젝트 정보 및 실행 스크립트
└── README.md           # 프로젝트 설명 문서
```
