import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';

@Component({
  selector: 'app-image-input',
  templateUrl: './image-input.component.html',
  styleUrls: ['./image-input.component.scss'],
})
export class ImageInputComponent implements OnInit, OnChanges {
  @ViewChild('filePicker') filePickerRef: ElementRef<HTMLInputElement>;
  @Output() imagePick = new EventEmitter<string | File>();
  @Input() isFetchedImage = false;
  @Input() fetchedImage: string;
  @Input() showPreview = false;
  selectedImage: string;
  usePicker = true;

  constructor() { }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isFetchedImage) {
      this.selectedImage = null;
    }
  }

  onPickImage() {
    this.filePickerRef.nativeElement.click();
  }

  onFileChosen(event: Event) {
    const pickedFile = (event.target as HTMLInputElement).files[0];
    if (!pickedFile) {
      return;
    }

    // convert to base64
    const fr = new FileReader();
    fr.onload = () => {
      const dataUrl = fr.result.toString();
      this.selectedImage = dataUrl;
      this.imagePick.emit(pickedFile);
    };
    fr.readAsDataURL(pickedFile);
  }

}