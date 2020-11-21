import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { Router } from '@angular/router';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {

  imagePath = 'assets/image_vector.png';
  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;
  @ViewChild('imageUpload') imageUpload: ElementRef;
  @ViewChild('nav') nav: ElementRef;
  imageFile;
  uploadForm: FormGroup;
  isUploading: boolean = false;
  userId = null;
  dataLoading:  boolean = true;
  imagesData: any[];
  successMessage = '';
  filterBy = 'recently';
  arrageBy = 'timestamp';
  imagePreviewDetails;
  constructor(private _firebaseAuth: AngularFireAuth, private _router: Router, private _modalService: NgbModal, public _formBuilder: FormBuilder, private _firebaseDatabase: AngularFireDatabase, private _firebaseStorage: AngularFireStorage) { 
    this.uploadForm = this._formBuilder.group({
      face: [false, Validators.required],
      place: [false, Validators.required],
      share: [0],
      imageTime: [null, Validators.required],
      imageFile: [null, Validators.required],
      filename: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.dataLoading = true;
    this.imagesData = [];
    this._firebaseAuth.currentUser.then((user)=> {
      this.userId = user.uid;
      this._firebaseDatabase.database.ref(`users/${this.userId}`).orderByChild('timestamp').limitToLast(24).once('value').then((resp)=>{
        resp.forEach(action => {
          this.imagesData.push(action.val())
        });
        this.dataLoading = false;
      });
      // this._firebaseDatabase.list(`users/${this.userId}`, ref => ref.orderByChild('timestamp').limitToFirst(24)).valueChanges().subscribe((resp)=> {
      //   this.imagesData = resp;
      //   this.dataLoading = false;
      // });
    });
  }

  ngAfterViewInit(): void {
    // console.log(this.nav.nativeElement.offsetHeight)
  }

  logout(){
    this._firebaseAuth.signOut().then(()=> {
      this._router.navigateByUrl('/login');
    });
  }

  openUploadDialog(uploadPicture){
    this._modalService.open(uploadPicture, {ariaLabelledBy: 'modal-basic-title', centered: true});
  }

  openDialogImage(){
    this.imageUpload.nativeElement.click();
  }

  getPicture(event){
    this.uploadForm.controls['imageFile'].setValue(event.target.files[0]);
    this.uploadForm.controls['imageTime'].setValue(event.target.files[0].lastModified);
    this.uploadForm.controls['filename'].setValue(event.target.files[0].name);
    let reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePath = e.target.result;
    };
    reader.readAsDataURL(event.srcElement.files[0]);
  }

  submit(formdata){
    let now = Date.now();
    const file = formdata.imageFile;
    const filePath = `users/${this.userId}/${now}${formdata.filename}`;
    const fileRef = this._firebaseStorage.ref(filePath);
    const task = this._firebaseStorage.upload(filePath, file);
    this.isUploading = true;
    delete formdata.imageFile;
    // observe percentage changes
    this.uploadPercent = task.percentageChanges();
    // get notified when the download URL is available
    task.snapshotChanges().pipe(
        finalize(() => {
          this.downloadURL = fileRef.getDownloadURL();
          this.downloadURL.subscribe((resp)=>{
            formdata['imageUrl'] = resp;
            formdata['timestamp'] = now;
            this._firebaseDatabase.object(`users/${this.userId}/${now}`).set(formdata).then(()=>{
              this.isUploading = false;
              this._modalService.dismissAll();
              this.uploadForm.reset();
              this.imagePath = 'assets/image_vector.png';
              this.uploadForm.controls['face'].setValue(false);
              this.uploadForm.controls['place'].setValue(false);
              this.scrollHandler('');
            });
          });
        })
      )
    .subscribe();
  }

  scrollHandler(e){
    setTimeout(()=>{
      switch (this.filterBy) {
        case 'recently':
          this._firebaseDatabase.database.ref(`users/${this.userId}`).orderByChild('timestamp').endAt(this.imagesData[0].timestamp-1).limitToFirst(12).once('value').then((resp)=>{
            resp.forEach(action => {
              if(this.imagesData.findIndex(image => image.timestamp === action.val().timestamp) == -1){
                this.imagesData.push(action.val());
              }
            });
          });        
          break;
        case 'time':
          this._firebaseDatabase.database.ref(`users/${this.userId}`).orderByChild('imageTime').endAt(this.imagesData[0].timestamp-1).limitToFirst(12).once('value').then((resp)=>{
            resp.forEach(action => {
              if(this.imagesData.findIndex(image => image.timestamp === action.val().timestamp) == -1){
                this.imagesData.push(action.val());
              }
            });
          });        
          break;
        case 'face':
          this._firebaseDatabase.database.ref(`users/${this.userId}`).orderByChild('face').equalTo(true).endAt(this.imagesData[0].timestamp-1).limitToFirst(12).once('value').then((resp)=>{
            resp.forEach(action => {
              if(this.imagesData.findIndex(image => image.timestamp === action.val().timestamp) == -1){
                this.imagesData.push(action.val());
              }
            });
          });
          break;
        case 'place':
          this._firebaseDatabase.database.ref(`users/${this.userId}`).orderByChild('place').equalTo(true).endAt(this.imagesData[0].timestamp-1).limitToFirst(12).once('value').then((resp)=>{
            resp.forEach(action => {
              if(this.imagesData.findIndex(image => image.timestamp === action.val().timestamp) == -1){
                this.imagesData.push(action.val());
              }
            });
          });
          break;
        case 'share':
          this._firebaseDatabase.database.ref(`users/${this.userId}`).orderByChild('share').endAt(1,this.imagesData[0].timestamp-1+"").limitToFirst(12).once('value').then((resp)=>{
            resp.forEach(action => {
              if(this.imagesData.findIndex(image => image.timestamp === action.val().timestamp) == -1){
                this.imagesData.push(action.val());
              }
            });
          });
          break;
        default:
          break;
      }
    }, 500);

  }

  share(image){
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = image.imageUrl;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);

    /* Copy the text inside the text field */
    document.execCommand("copy");

    this._firebaseDatabase.object(`users/${this.userId}/${image.timestamp}`).update({
      share: image.share+1
    });

    this.successMessage = "Image Link has been copied";
    setTimeout(()=>{
      this.successMessage = '';
    },2500);
  }

  filterByData(){
    switch (this.filterBy) {
      case 'recently':
        this.arrageBy = 'timestamp';
        this.dataLoading = true;
        this.imagesData = [];
        this._firebaseDatabase.database.ref(`users/${this.userId}`).orderByChild('timestamp').limitToLast(24).once('value').then((resp)=>{
          resp.forEach(action => {
            this.imagesData.push(action.val())
          });
          this.dataLoading = false;
        });
        break;
      case 'time':
        this.arrageBy = 'imageTime';
        this.dataLoading = true;
        this.imagesData = [];
        this._firebaseDatabase.database.ref(`users/${this.userId}`).orderByChild('imageTime').limitToLast(24).once('value').then((resp)=>{
          resp.forEach(action => {
            this.imagesData.push(action.val())
          });
          this.dataLoading = false;
        });
        break;
      case 'face':
        this.arrageBy = 'timestamp';
        this.dataLoading = true;
        this.imagesData = [];
        this._firebaseDatabase.database.ref(`users/${this.userId}`).orderByChild('face').equalTo(true).limitToLast(24).once('value').then((resp)=>{
          resp.forEach(action => {
            this.imagesData.push(action.val())
          });
          this.dataLoading = false;
        });
        break;
      case 'place':
        this.arrageBy = 'timestamp';
        this.dataLoading = true;
        this.imagesData = [];
        this._firebaseDatabase.database.ref(`users/${this.userId}`).orderByChild('place').equalTo(true).limitToLast(24).once('value').then((resp)=>{
          resp.forEach(action => {
            this.imagesData.push(action.val())
          });
          this.dataLoading = false;
        });
        break;
      case 'share':
        this.arrageBy = 'share';
        this.dataLoading = true;
        this.imagesData = [];
        this._firebaseDatabase.database.ref(`users/${this.userId}`).orderByChild('share').startAt(1).limitToLast(24).once('value').then((resp)=>{
          resp.forEach(action => {
            this.imagesData.push(action.val())
          });
          this.dataLoading = false;
        });
        break;
      default:
        break;
    }
  }

  removeDublicateData(data){
    const filteredArr = data.reduce((acc, current) => {
      const x = acc.find(item => item.timestamp === current.timestamp);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);
    this.imagesData = filteredArr;
  }

  previewDialog(previewImage, photo){
    this.imagePreviewDetails = photo;
    this._modalService.open(previewImage, {ariaLabelledBy: 'modal-preview-title', centered: true});
  }

  deleteImage(){
    this._firebaseStorage.ref(`users/${this.userId}/${this.imagePreviewDetails.timestamp}${this.imagePreviewDetails.filename}`).delete().subscribe(()=>{
      this._firebaseDatabase.object(`users/${this.userId}/${this.imagePreviewDetails.timestamp}`).remove();
      this.scrollHandler('');
      this._modalService.dismissAll();
    });
  }

}
