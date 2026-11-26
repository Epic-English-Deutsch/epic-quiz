/* 빈칸 양자택일 (어법) — 29~35번 */
QUIZ_DATA.items.push(
{
  id: "g29", cat: "grammar", no: "29", num: 29,
  title: "생존 경쟁과 인구 증가",
  type: "어법 양자택일",
  instruction: "다음 글의 빈칸 (1)~(6)에서 어법상 알맞은 것을 고르시오.",
  paragraphs: [
    "You might think of survival as a race {{1}} a hurdle has to be jumped every year. The early hurdles were once very high, and many people fell before {{2}} the first few. Demographically, humankind was living close to a state of nature, and nature is extremely wasteful of life. From only a very small number of figs will even one of many seeds {{3}} a fig tree.",
    "Almost a quarter of baboons born in the wild die before they are a year old, which {{4}} fairly typical for primates. Infant mortality rates for humans in pre-modern agricultural societies were similar to, and sometimes higher, than {{5}} of apes. Things were little better for our hunter-gatherer ancestors, a quarter of {{6}} failed to reach their first birthday, while another quarter didn’t live long enough to reproduce just about everywhere until the nineteenth century. Had it been otherwise, the huge recent growth in human population would have occurred much earlier."
  ],
  blanks: [
    { n: 1, opts: ["in which", "which"], answer: 0, why: "「전치사 + 관계대명사」 자리입니다. 뒤에 「a hurdle has to be jumped」라는 완전한 절이 오므로 which만으로는 이을 수 없고, 「경주 안에서(in)」라는 의미의 in이 필요합니다." },
    { n: 2, opts: ["clearing", "cleared"], answer: 0, why: "전치사 before 뒤에는 동명사가 옵니다. many people이 허들을 넘는 주체이므로 수동(cleared)이 아니라 능동(clearing)입니다." },
    { n: 3, opts: ["become", "becomes"], answer: 0, why: "부사구(From only a very small number of figs)가 문장 앞으로 나와 「조동사 will + 주어 + 동사원형」 어순으로 도치되었습니다. 조동사 뒤에는 동사원형 become이 맞습니다." },
    { n: 4, opts: ["is", "are"], answer: 0, why: "계속적 용법의 which가 앞 절 전체(개코원숭이 4분의 1이 한 살 전에 죽는다는 사실)를 받으므로 단수 취급하여 is를 씁니다." },
    { n: 5, opts: ["those", "that"], answer: 0, why: "비교 대상인 Infant mortality rates(복수)를 대신하는 복수 대명사 those가 필요합니다. 단수 that은 올 수 없습니다." },
    { n: 6, opts: ["whom", "them"], answer: 0, why: "콤마 앞이 완전한 문장이고 뒤에도 주어+동사가 있으므로 접속사나 관계사 없이 콤마로만 이을 수 없습니다. 「a quarter of + 목적격 관계대명사(whom)」로 이어야 합니다." }
  ],
  summary: "인류는 오랫동안 높은 사망률 속에서 살았고, 그래서 인구의 폭발적 증가는 최근에야 일어났다."
},
{
  id: "g30", cat: "grammar", no: "30", num: 30,
  title: "비언어적 신호의 우위",
  type: "어법 양자택일",
  instruction: "다음 글의 빈칸 (1)~(6)에서 어법상 알맞은 것을 고르시오.",
  paragraphs: [
    "A study by Eva McMahan, professor of speech communication, confirmed the dominance of nonverbal signals. The phenomenon, however, was especially pronounced when adults {{1}} themselves in situations with conflicting messages (i.e., situations in which the contents of the verbal and nonverbal messages {{2}}).",
    "Attempts to manipulate another person verbally are therefore likely {{3}} if the accompanying nonverbal communication does not match the spoken message. This is because people trust nonverbal messages {{4}} than verbal ones.",
    "When somebody tells you that they enjoy {{5}} time with you, but you notice how they are looking away and are forcing a smile, you are probably less {{6}} to believe their words. The same is probably true when you are back at the office after a sickness and your colleague tells you with a smiling expression that they were happy to take over your workload. You might not believe that they enjoyed replacing you while you were gone."
  ],
  blanks: [
    { n: 1, opts: ["found", "founded"], answer: 0, why: "「find oneself + 전치사구(~한 상황에 처해 있음을 알다)」 표현입니다. found는 find의 과거형이고, founded는 ‘설립하다’라는 전혀 다른 동사의 과거형입니다." },
    { n: 2, opts: ["differ", "differs"], answer: 0, why: "주어 the contents가 복수이므로 복수 동사 differ가 맞습니다." },
    { n: 3, opts: ["to fail", "failing"], answer: 0, why: "be likely to부정사: 「~할 가능성이 있다」. likely 뒤에는 to부정사가 옵니다." },
    { n: 4, opts: ["more", "most"], answer: 0, why: "뒤에 than이 있으므로 비교급 more가 필요합니다. 최상급 most는 than과 함께 쓰지 않습니다." },
    { n: 5, opts: ["spending", "to spend"], answer: 0, why: "enjoy는 목적어로 동명사만 취하는 동사입니다(enjoy -ing)." },
    { n: 6, opts: ["inclined", "inclining"], answer: 0, why: "「be inclined to + 동사원형(~하는 경향이 있다)」에서 inclined는 형용사로 쓰인 과거분사입니다." }
  ],
  summary: "언어적 메시지와 비언어적 메시지가 어긋나면 사람들은 비언어적 메시지를 더 믿기 때문에, 몸짓이 따르지 않는 말로는 상대를 조종하기 어렵다."
},
{
  id: "g31", cat: "grammar", no: "31", num: 31,
  title: "기본 설정과 자동화",
  type: "어법 양자택일",
  instruction: "다음 글의 빈칸 (1)~(6)에서 어법상 알맞은 것을 고르시오.",
  paragraphs: [
    "A person {{1}} lives eighty years lives some twenty-nine thousand days, and the overwhelming majority of the behaviour {{2}} into them runs on settings laid down, most of them, decades earlier and rarely inspected since. This need not be a hopeless thought. In one light it is a triumph of engineering. If you had to consciously decide every footstep and every fork-grip and every word, you {{3}} it out of bed; the deliberate mind is far too slow and too costly {{4}} a whole life in real time, and any creature that tried would be {{5}} by a creature that didn’t.",
    "The automation is precisely what frees the captain to come up on deck for the few problems that actually require him. The default is not a flaw in the human design. It is arguably the central feature, the thing that {{6}} a complex life affordable at all."
  ],
  blanks: [
    { n: 1, opts: ["who", "whom"], answer: 0, why: "관계대명사절 안에서 주어 역할을 하므로 주격 who가 맞습니다. (lives의 주어)" },
    { n: 2, opts: ["packed", "packing"], answer: 0, why: "behaviour는 ‘채워지는’ 대상이므로 수동의 의미를 지닌 과거분사 packed가 맞습니다. 「the behaviour (that is) packed into them」." },
    { n: 3, opts: ["would never make", "will never make"], answer: 0, why: "If you had to decide ~(가정법 과거)에 대응하는 귀결절이므로 「would + 동사원형」이 필요합니다." },
    { n: 4, opts: ["to run", "running"], answer: 0, why: "「too + 형용사 + to부정사(~하기에 너무 …하다)」 구문입니다. to run이 맞습니다." },
    { n: 5, opts: ["outcompeted", "outcompeting"], answer: 0, why: "any creature가 다른 생물에게 ‘경쟁에서 밀리는’ 대상이므로 수동태 「be outcompeted by」가 맞습니다." },
    { n: 6, opts: ["makes", "make"], answer: 0, why: "관계대명사 that의 선행사 the thing이 단수이므로 단수 동사 makes가 맞습니다." }
  ],
  summary: "우리의 행동 대부분은 과거에 정해진 ‘기본 설정’대로 자동으로 처리되며, 그 자동화가 복잡한 삶을 가능하게 한다."
},
{
  id: "g32", cat: "grammar", no: "32", num: 32,
  title: "대중문화와 사법적 판단",
  type: "어법 양자택일",
  instruction: "다음 글의 빈칸 (1)~(6)에서 어법상 알맞은 것을 고르시오.",
  paragraphs: [
    "If we understand mass culture as a weakening factor of the cultural ties {{1}} unite people to their traditions, mass culture weakens the intermediary institutions in society (e.g. the family or the school), {{2}} their role and overlapping these institutions.",
    "For example, courts are traditional social institutions and important for the normal and harmonious {{3}} of collective life. However, when people turn to social networks {{4}} pressure on judicial decisions in certain mediated and politicized processes, this practice is popularized and becomes a habitual form of culture, which {{5}} harmful.",
    "Justice must not {{6}} in the public square, which today is converted into a virtual dimension, the social networks. In a democratic state of law, the appropriate place to judge and make justice is the court and in a way that is immune to popular pressure."
  ],
  blanks: [
    { n: 1, opts: ["that", "what"], answer: 0, why: "선행사 the cultural ties가 있으므로 관계대명사 that이 필요합니다. what은 선행사를 포함하므로 앞에 명사가 오면 쓸 수 없습니다." },
    { n: 2, opts: ["diminishing", "diminished"], answer: 0, why: "주절(mass culture weakens ~)에 이어지는 분사구문으로, 주어 mass culture가 능동적으로 ‘역할을 줄이는’ 주체이므로 현재분사 diminishing이 맞습니다." },
    { n: 3, opts: ["functioning", "functioned"], answer: 0, why: "「the normal and harmonious functioning of collective life」처럼 전치사 of 앞에는 명사 상당어가 와야 하며, 형용사 수식을 받는 동명사 functioning이 맞습니다." },
    { n: 4, opts: ["to put", "putting"], answer: 0, why: "「turn to + 명사 + to부정사(~하기 위해 …에 의지하다)」로 목적을 나타내는 to부정사가 필요합니다." },
    { n: 5, opts: ["is", "are"], answer: 0, why: "계속적 which가 앞 절 전체(이 관행이 대중화되어 습관적 문화가 되는 것)를 받으므로 단수 is가 맞습니다." },
    { n: 6, opts: ["be done", "be doing"], answer: 0, why: "「Justice must not be done」처럼 정의가 ‘행해지는’ 대상이므로 수동태 be done이 맞습니다. 조동사 must 뒤이므로 be+p.p. 형태입니다." }
  ],
  summary: "대중문화는 가족·학교·법원 같은 중간 기관을 약화시키므로, 정의는 SNS 여론이 아니라 대중의 압력에서 자유로운 법정에서 실현되어야 한다."
},
{
  id: "g33", cat: "grammar", no: "33", num: 33,
  title: "가소성과 평생 발달",
  type: "어법 양자택일",
  instruction: "다음 글의 빈칸 (1)~(6)에서 어법상 알맞은 것을 고르시오.",
  paragraphs: [
    "Human development is now increasingly understood as an ongoing, flexible, and {{1}} process rather than a {{2}} sequence of stages. At the core of this perspective {{3}} the concept of plasticity. Plasticity refers to the human capacity to change, adapt, and reorganize cognitive, emotional, and behavioural patterns in response to life experiences, environmental demands, and biological changes. It highlights that individuals are not merely passive recipients of development but active agents capable {{4}} growth throughout their lives.",
    "In earlier views, development was believed {{5}} mainly during childhood, with adulthood {{6}} as a period of stability and old age as a phase of decline. The concept of plasticity challenges this rigid outlook by emphasizing that development continues across the entire lifespan. Although the extent of change may vary at different stages, every phase of life allows room for adaptation and transformation."
  ],
  blanks: [
    { n: 1, opts: ["evolving", "evolved"], answer: 0, why: "an ongoing, flexible, and evolving process: 진행·능동의 의미로 ‘진화하는’ 과정을 뜻하므로 현재분사 evolving이 맞습니다. 병렬 구조(ongoing, flexible, evolving)로도 확인됩니다." },
    { n: 2, opts: ["fixed", "fixing"], answer: 0, why: "‘고정된’ 단계의 연속이라는 수동의 의미이므로 과거분사 fixed가 맞습니다." },
    { n: 3, opts: ["lies", "lie"], answer: 0, why: "전치사구가 문장 앞에 나와 주어 the concept of plasticity가 뒤에 오는 도치 구문입니다. 주어가 단수이므로 lies가 맞습니다." },
    { n: 4, opts: ["of", "to"], answer: 0, why: "capable of + 명사/동명사(~할 능력이 있는) 구문입니다. to는 오지 않습니다." },
    { n: 5, opts: ["to occur", "occurring"], answer: 0, why: "be believed to부정사: 「~한다고 믿어졌다」. 수동태 뒤에는 to부정사가 옵니다." },
    { n: 6, opts: ["seen", "seeing"], answer: 0, why: "「with + 목적어(adulthood) + 목적격보어」 구문에서 adulthood는 ‘여겨지는’ 대상이므로 과거분사 seen이 맞습니다." }
  ],
  summary: "가소성 개념은 발달이 아동기에 끝나는 것이 아니라 전 생애에 걸쳐 계속되며, 인생의 모든 단계가 적응과 변화의 여지를 남긴다는 것을 보여 준다."
},
{
  id: "g34", cat: "grammar", no: "34", num: 34,
  title: "상호 연결과 복합적 실패",
  type: "어법 양자택일",
  instruction: "다음 글의 빈칸 (1)~(6)에서 어법상 알맞은 것을 고르시오.",
  paragraphs: [
    "Social media has altered business, politics, and friendships, {{1}} going viral a household term. The global financial industry links every bank and countless households in every country, making us {{2}} to human error taking place on the other side of the world.",
    "As Columbia University strategy professor Rita McGrath explains, years ago most of our institutions were separate and thereby {{3}} from the effects of errors outside their walls. That is no longer the case. The digitization of massive amounts of information has continued to grow enormously as the cost of computing power has decreased. The development of smart systems {{4}} communicate autonomously gave rise to an infinite variety of potential breakdowns. This interdependence is a breeding ground for complex failure.",
    "As Rita puts it, when “things that used to be kept separate {{5}} up against each other, it becomes far more difficult {{6}} what’s going to happen next.”"
  ],
  blanks: [
    { n: 1, opts: ["making", "made"], answer: 0, why: "앞 절 전체를 받아 ‘~하게 만들면서’라는 의미를 더하는 분사구문입니다. 주어 Social media가 능동의 주체이므로 현재분사 making이 맞습니다." },
    { n: 2, opts: ["vulnerable", "vulnerably"], answer: 0, why: "「make + 목적어(us) + 목적격보어」에서 us의 상태를 나타내는 형용사 vulnerable이 필요합니다. 부사 vulnerably는 올 수 없습니다." },
    { n: 3, opts: ["buffered", "buffering"], answer: 0, why: "institutions가 오류의 영향으로부터 ‘보호받는’ 대상이므로 수동의 과거분사 buffered가 맞습니다." },
    { n: 4, opts: ["that", "what"], answer: 0, why: "선행사 smart systems가 있으므로 주격 관계대명사 that이 맞습니다." },
    { n: 5, opts: ["bump", "bumping"], answer: 0, why: "when절의 주어 things에 대한 동사 자리입니다. 주어가 복수이고 현재 시제이므로 동사원형 bump가 맞습니다." },
    { n: 6, opts: ["to predict", "predicting"], answer: 0, why: "「It becomes difficult to부정사」 구문에서 가주어 it에 대응하는 진주어는 to부정사입니다." }
  ],
  summary: "정보기술로 기관과 시스템이 서로 연결되면서 작은 오류의 영향이 순식간에 퍼져, 복합적 실패를 예측하기 어려워졌다."
},
{
  id: "g35", cat: "grammar", no: "35", num: 35,
  title: "의학의 발전과 전염병",
  type: "어법 양자택일",
  instruction: "다음 글의 빈칸 (1)~(6)에서 어법상 알맞은 것을 고르시오. (원문에서 글의 흐름과 관계없는 문장은 제외했습니다.)",
  paragraphs: [
    "Scientific developments and technologies in medical practice have brought us enormous progress in the treatment and {{1}} of infectious diseases.",
    "The discovery of penicillin in 1928 by Alexander Fleming, for {{2}} he later received the Nobel Prize, was one of the biggest breakthroughs in the battle against infectious diseases. Edward Jenner discovered around 1796 that humans were protected against the deadly smallpox virus after {{3}} to the cowpox virus, which {{4}} harmless to humans.",
    "Vaccines {{5}} in laboratories have contributed enormously to the reduction of the burden of bacterial and viral diseases and have even {{6}} to the elimination of poxvirus. For other infectious diseases (for example cholera and malaria), control and hygiene management measures have reduced their burden, while for others treatment therapies turned viral diseases that were deadly into chronic manageable diseases."
  ],
  blanks: [
    { n: 1, opts: ["prevention", "preventing"], answer: 0, why: "「the treatment and prevention of ~」에서 and로 병렬 연결되는 자리는 전치사 of의 목적어가 되는 명사입니다. 동명사 preventing이 아니라 명사 prevention이 맞습니다." },
    { n: 2, opts: ["which", "that"], answer: 0, why: "전치사 for 뒤에는 관계대명사 that을 쓸 수 없습니다. 「for which he received ~」처럼 전치사 + which 형태여야 합니다." },
    { n: 3, opts: ["exposure", "exposing"], answer: 0, why: "전치사 after 뒤에는 명사(구)가 와야 합니다. 「exposure to ~(~에 노출)」라는 명사가 맞습니다." },
    { n: 4, opts: ["is", "being"], answer: 0, why: "계속적 관계대명사 which절에는 정동사가 필요합니다. which의 선행사 the cowpox virus가 단수이므로 is가 맞습니다." },
    { n: 5, opts: ["developed", "developing"], answer: 0, why: "Vaccines는 실험실에서 ‘개발되는’ 대상이므로 수동의 과거분사 developed가 맞습니다. 「Vaccines (which were) developed in laboratories」." },
    { n: 6, opts: ["led", "leading"], answer: 0, why: "have contributed ... and have even ___로 have와 병렬을 이루는 과거분사 led가 필요합니다. 「lead to ~」의 완료형입니다." }
  ],
  summary: "백신, 위생 관리, 치료법의 발전이 전염병의 부담을 크게 줄여 왔다."
}
);
