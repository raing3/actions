import { GitHub } from '@actions/github';
import * as github from "@actions/github";
import * as exec from "@actions/exec";
import fs from 'fs';
import {isReleased} from "../util";
import * as core from "@actions/core";

export const createRelease = async (client: GitHub, version: string) => {
    const tag = `v${version}`;
    let output = '';

    if (await isReleased(client, tag)) {
        core.info(`GitHub release for version ${version} already exists, skipping creation.`);
        return;
    }

    await exec.exec(`npm pack`, [], {
        listeners: {
            stdout: (data: Buffer) => output += data.toString()
        }
    });

    const fileName = output.trim();

    const release = await client.repos.createRelease({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        tag_name: tag,
        name: `Release ${tag}`
    });

    await client.repos.uploadReleaseAsset({
        url: release.data.upload_url,
        name: fileName,
        data: fs.readFileSync(fileName),
        headers: {
            "content-length": fs.statSync(fileName).size,
            "content-type": 'application/x-gzip'
        }
    });
};