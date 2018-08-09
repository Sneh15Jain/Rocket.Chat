/* globals FileUpload */

import _ from 'underscore';
import { FileUploadClass } from '../lib/FileUpload';
import '../../ufs/IPFSStorage/server.js';
import http from 'http';
import https from 'https';

const get = function(file, req, res) {
	this.store.getRedirectURL(file, (err, fileUrl) => {
		if (err) {
			console.error(err);
		}

		if (fileUrl) {
			const storeType = file.store.split(':').pop();
			if (RocketChat.settings.get(`FileUpload_GoogleStorage_Proxy_${ storeType }`)) {
				const request = /^https:/.test(fileUrl) ? https : http;
				request.get(fileUrl, fileRes => fileRes.pipe(res));
			} else {
				res.removeHeader('Content-Length');
				res.setHeader('Location', fileUrl);
				res.writeHead(302);
				res.end();
			}
		} else {
			res.end();
		}
	});
};

const copy = function(file, out) {
	this.store.getRedirectURL(file, (err, fileUrl) => {
		if (err) {
			console.error(err);
		}

		if (fileUrl) {
			const request = /^https:/.test(fileUrl) ? https : http;
			request.get(fileUrl, fileRes => fileRes.pipe(out));
		} else {
			out.end();
		}
	});
};

const IpfsStorageUploads = new FileUploadClass({
	name: 'IpfsStorage:Uploads',
	get,
	copy
	// store setted bellow
});

const IpfsStorageAvatars = new FileUploadClass({
	name: 'IpfsStorage:Avatars',
	get,
	copy
	// store setted bellow
});

const IpfsStorageUserDataFiles = new FileUploadClass({
	name: 'IpfsStorage:UserDataFiles',
	get,
	copy
	// store setted bellow
});

const configure = _.debounce(function() {
	const path = RocketChat.settings.get('FileUpload_IPFSStorage_Folder');
	const provider = RocketChat.settings.get('FileUpload_IPFSStorage_Provider');
	const secret = RocketChat.settings.get('FileUpload_IPFSStorage_Secret');
	// const URLExpiryTimeSpan = RocketChat.settings.get('FileUpload_S3_URLExpiryTimeSpan');

	if (!path || !provider || !secret) {
		return;
	}

	const config = {
		connection: {
			credentials: {
				// client_email: accessId,
				private_key: secret
			}
		},
		path,
		provider
	};

	IpfsStorageUploads.store = FileUpload.configureUploadsStore('GoogleStorage', IpfsStorageUploads.name, config);
	IpfsStorageAvatars.store = FileUpload.configureUploadsStore('GoogleStorage', IpfsStorageAvatars.name, config);
	IpfsStorageUserDataFiles.store = FileUpload.configureUploadsStore('GoogleStorage', IpfsStorageUserDataFiles.name, config);
}, 500);

RocketChat.settings.get(/^FileUpload_IPFSStorage_/, configure);
