import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import swaggerAutogen from "swagger-autogen";
import swaggerUiExpress from "swagger-ui-express";

import mysql from "mysql2/promise"; // pool 및 db 사용 시 필요한 import 문

import { handleUserSignUp } from "./controllers/user.controller.js";
import { handleStoreUpload } from "./controllers/store.controller.js";
import { handleReviewUpload } from "./controllers/review.controller.js";
import { handleMissionUpload } from "./controllers/mission.controller.js";
import { handleUserMissionUpload } from "./controllers/user_mission.controller.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000; 

// pool 사용 전 미리 pool 선언! 순서 중요함. 
const pool = mysql.createPool({ //user 를 root 로 적용해야함.
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// 생성된 연결 풀을 애플리케이션에 설정
app.set("pool", pool);

app.use(cors({
  origin: ['http://localhost:3000', 'http://example.com']
}));                            // cors 방식 허용
app.use(express.static('public'));          // 정적 파일 접근
app.use(express.json());                    // request의 본문을 json으로 해석할 수 있도록 함 (JSON 형태의 요청 body를 파싱하기 위함)
app.use(express.urlencoded({ extended: false })); // 단순 객체 문자열 형태로 본문 데이터 해석

app.use(
  "/docs",
  swaggerUiExpress.serve,
  swaggerUiExpress.setup({}, {
    swaggerOptions: {
      url: "/openapi.json",
    },
  })
);

app.get("/openapi.json", async (req, res, next) => {
  // #swagger.ignore = true
  const options = {
    openapi: "3.0.0",
    disableLogs: true,
    writeOutputFile: false,
  };
  const outputFile = "/dev/null"; // 파일 출력은 사용하지 않습니다.
  const routes = ["./src/index.js"];
  const doc = {
    info: {
      title: "UMC 7th",
      description: "UMC 7th Node.js 테스트 프로젝트입니다.",
    },
    host: "localhost:3000",
  };

  const result = await swaggerAutogen(options)(outputFile, routes, doc);
  res.json(result ? result.data : null);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// API 엔드포인트 정의
// 1 - user uploading api
app.post("/api/v1/users/signup", handleUserSignUp);
// 2 - store uploading api
app.post("/api/regions/:region_id/stores", handleStoreUpload);
// 3 - review uploding for store api
app.post("/api/v1/reviews", handleReviewUpload);
// 4 - mission uploading for store's mission api
app.post("/api/v1/missions", handleMissionUpload);

//5 - user_mission uploading for user_mission api
app.post("/api/v1/user-missions", handleUserMissionUpload);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});






