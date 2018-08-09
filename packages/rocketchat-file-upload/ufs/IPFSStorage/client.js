import {UploadFS} from 'meteor/jalik:ufs';

export class IpfsStorageStore extends UploadFS.Store {}

// Add store to UFS namespace
UploadFS.store.IPFSStorage = IpfsStorageStore;
