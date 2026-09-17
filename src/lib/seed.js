// 데모용 예시 과제 (발주사·인물 모두 가상)
import { DEFAULT_POOL, ROLE_MAP, pickSupervisors, ruleReason, scoreStudent } from "./engine.js";

function make({ id, client, title, summary, weeks, status, daysAgo, roles, mine = false, budget = "" }) {
  const project = {
    id, client, title, summary, weeks, status, budget, mine, example: true, source: "example",
    decision: "accept", decisionReason: "", deliverables: [], equipment: [], risks: [], questions: [], teamNote: "",
    createdAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    roles: roles.map(([roleId, hours, ids, focus], i) => ({
      key: "r" + (i + 1), roleId, hours, count: ids.length, skills: [], focus: focus || ROLE_MAP[roleId].deliverable, assigned: [],
    })),
  };
  project.roles.forEach((role, i) => {
    role.assigned = roles[i][2].map((sid) => ({ id: sid, source: "example", reason: ruleReason(scoreStudent(DEFAULT_POOL.map[sid], role, { weeks }), DEFAULT_POOL) }));
  });
  return { ...project, ...pickSupervisors(project) };
}

export function seedProjects() {
  return [
    make({
      id: "OTS-001", client: "오롯문구", title: "문구 브랜드 캐릭터 굿즈", summary: "마스코트 캐릭터 3종과 스티커·엽서 굿즈 디자인", weeks: 4, status: "recruiting", daysAgo: 2, budget: "100-200",
      roles: [["pm", 8, ["C04"]], ["illust", 30, ["C16"], "캐릭터 3종 시트"], ["brand", 14, ["C13"], "스티커·엽서 인쇄 파일"], ["rights", 5, ["C06"]]],
    }),
    make({
      id: "OTS-002", client: "밤새게임즈", title: "인디게임 스팀 트레일러", summary: "60초 트레일러, 효과음, 상점 소개문 한·일", weeks: 5, status: "recruiting", daysAgo: 3, budget: "300-500",
      roles: [["pm", 10, ["C02"]], ["motion", 32, ["C21"], "플레이 영상 편집·모션 타이틀"], ["sound", 16, ["C40"], "트레일러 효과음·테마곡"], ["copy", 10, ["C46"], "상점 소개문 일본어 번역"], ["rights", 5, ["C09"]]],
    }),
    make({
      id: "OTS-003", client: "한결테크", title: "가습기 펀딩 3D 렌더·랜딩", summary: "제품 렌더 8컷, 상세페이지 카피, 알림 신청 랜딩", weeks: 4, status: "recruiting", daysAgo: 1, budget: "300-500", mine: true,
      roles: [["pm", 10, ["C03"]], ["model3d", 36, ["C38"], "렌더 8컷·컬러 3종"], ["copy", 14, ["C44"], "상세페이지 카피"], ["web", 20, ["C24"], "알림 신청 랜딩"], ["rights", 4, ["C07"]]],
    }),
    make({
      id: "OTS-004", client: "망원 수공방", title: "로컬마켓 팝업 부스", summary: "3일 팝업 부스 연출과 안내 사인물", weeks: 3, status: "recruiting", daysAgo: 4, budget: "100-200",
      roles: [["pm", 8, ["C01"]], ["space", 24, ["C51"], "부스 도면·설치 가이드"], ["brand", 10, ["C14"], "사인물·포스터"], ["rights", 4, ["C09"]]],
    }),
    make({
      id: "OTS-000", client: "상명 동아리연합회", title: "축제 스팟 영상", summary: "30초 축제 홍보 영상과 로고송", weeks: 3, status: "active", daysAgo: 12, mine: true, budget: "100-200",
      roles: [["pm", 8, ["C05"]], ["motion", 24, ["C19"], "30초 홍보 영상"], ["sound", 10, ["C41"], "로고송"], ["rights", 4, ["C08"]]],
    }),
  ];
}
